import torch
import cv2
import numpy as np
from pytorch_grad_cam import GradCAM, ScoreCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

def reshape_transform(tensor, height=7, width=7):
    # For Swin Transformer (timm)
    # The output of norm is usually (B, H*W, C) or (B, H, W, C)
    # We need it to be (B, C, H, W)
    if tensor.dim() == 3:
        b, num_patches, c = tensor.size()
        h = w = int(num_patches ** 0.5)
        return tensor.reshape(b, h, w, c).permute(0, 3, 1, 2)
    elif tensor.dim() == 4:
        # If it's already 4D, it's likely (B, H, W, C) from a block
        return tensor.permute(0, 3, 1, 2)
    return tensor

class Explainer:
    def __init__(self, model, device):
        self.model = model
        self.device = device
        
        # Target Stage 3 block to avoid attention sink noise and get 14x14 higher-res heatmaps
        self.target_layers = [self.model.layers[-2].blocks[-1].norm2]
        
        # Use EigenCAM as it works robustly with Vision Transformers without depending heavily on gradients
        # Or GradCAM. Let's use GradCAM for class-specific attention.
        self.grad_cam = GradCAM(
            model=self.model,
            target_layers=self.target_layers,
            reshape_transform=reshape_transform
        )
        
        self.score_cam = ScoreCAM(
            model=self.model,
            target_layers=self.target_layers,
            reshape_transform=reshape_transform
        )

    def generate_heatmap(self, input_tensor, original_image, class_idx=None, cam_method='gradcam'):
        """
        input_tensor: (1, 3, 224, 224) preprocessed tensor
        original_image: PIL Image or numpy array
        class_idx: int, the class to explain
        """
        targets = None
        if class_idx is not None:
            targets = [ClassifierOutputTarget(class_idx)]
            
        if cam_method == 'scorecam':
            # ScoreCAM runs N forward passes (one per channel, 768 channels in stage 3)
            # Batch input to speed it up significantly on GPU/CPU
            grayscale_cam = self.score_cam(input_tensor=input_tensor, targets=targets)
        else:
            # GradCAM runs in a single backward pass (~0.1 seconds)
            grayscale_cam = self.grad_cam(input_tensor=input_tensor, targets=targets)
            
        grayscale_cam = grayscale_cam[0, :]
        
        # Noise Reduction: Zero out weak low-level background activations (< 0.25 threshold)
        threshold = 0.25
        grayscale_cam[grayscale_cam < threshold] = 0.0
        
        # Re-normalize remaining non-zero activation signal
        if grayscale_cam.max() > 0:
            grayscale_cam = (grayscale_cam - grayscale_cam.min()) / (grayscale_cam.max() - grayscale_cam.min() + 1e-8)
            
        # Smooth activation contours using Gaussian Blur
        grayscale_cam = cv2.GaussianBlur(grayscale_cam, (7, 7), 0)
        
        # Resize original image to match tensor size (224x224) for overlay
        if not isinstance(original_image, np.ndarray):
            original_image = np.array(original_image)
        original_image = cv2.resize(original_image, (224, 224))
        
        # Normalize original image to [0, 1]
        rgb_img = original_image.astype(np.float32) / 255.0
        
        visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
        return visualization
