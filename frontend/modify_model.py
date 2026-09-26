# -*- coding: utf-8 -*-
with open('src/routes/model.tsx', 'r', encoding='utf-8') as f:
    model_content = f.read()

if 'import TaxonomyModal' not in model_content:
    model_content = model_content.replace(
        "import { BrainCircuit, Cpu, Database, Eye, Layers } from 'lucide-react';",
        "import { BrainCircuit, Cpu, Database, Eye, Layers } from 'lucide-react';\nimport { useState } from 'react';\nimport TaxonomyModal from '../components/TaxonomyModal';"
    )

if 'selectedTaxonomy' not in model_content:
    model_content = model_content.replace(
        "export default function ModelTab() {",
        "export default function ModelTab() {\n  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string | null>(null);"
    )

# Add onClick to finding div
model_content = model_content.replace(
    'className="flex items-center gap-3.5 p-4 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs"',
    'className="flex items-center gap-3.5 p-4 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50/80 dark:bg-slate-800/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-xs cursor-pointer"\n              onClick={() => setSelectedTaxonomy(item.name)}'
)

# Add Modal component at the end of the return statement
if '<TaxonomyModal' not in model_content:
    model_content = model_content.replace(
        "      </div>\n    </div>",
        "      </div>\n      <TaxonomyModal conditionId={selectedTaxonomy} onClose={() => setSelectedTaxonomy(null)} />\n    </div>"
    )

with open('src/routes/model.tsx', 'w', encoding='utf-8') as f:
    f.write(model_content)
print("model.tsx updated")
