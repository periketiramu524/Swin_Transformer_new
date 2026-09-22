# -*- coding: utf-8 -*-
with open('src/routes/results.tsx', 'r', encoding='utf-8') as f:
    results = f.read()

# Fix the first one
results = results.replace(
    '''className="rounded-full transition-all duration-1000 shadow-sm h-0"''',
    '''className="rounded-full transition-all duration-1000 shadow-sm h-full"'''
)
results = results.replace(
    '''borderTop: '10px solid ' + finding.activeIndicatorColor,''',
    '''backgroundColor: finding.activeIndicatorColor,'''
)

# Fix the second one
results = results.replace(
    '''className="rounded-full transition-all duration-700 shadow-sm h-0"''',
    '''className="rounded-full transition-all duration-700 shadow-sm h-full"'''
)

with open('src/routes/results.tsx', 'w', encoding='utf-8') as f:
    f.write(results)
print('Results bars fixed')
