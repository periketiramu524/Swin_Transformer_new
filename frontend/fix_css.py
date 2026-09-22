# -*- coding: utf-8 -*-
with open('src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

print_adjust = '''
  .print\\:block { display: block !important; }
  .print\\:w-full { width: 100% !important; }
  
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}'''

css = css.replace('''
  .print\:block { display: block !important; }
  .print\:w-full { width: 100% !important; }
}''', print_adjust)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('CSS fixed')
