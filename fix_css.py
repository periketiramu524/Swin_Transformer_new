import codecs

path = r'frontend/src/routes/results.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read()

text = text.replace(
    'backgroundColor: item.activeIndicatorColor',
    'backgroundColor: item.activeIndicatorColor, boxShadow: "inset 0 0 0 100px " + item.activeIndicatorColor, borderRight: "2px solid " + item.activeIndicatorColor'
)
text = text.replace(
    'backgroundColor: finding.activeIndicatorColor,',
    'backgroundColor: finding.activeIndicatorColor, boxShadow: "inset 0 0 0 100px " + finding.activeIndicatorColor, borderRight: "2px solid " + finding.activeIndicatorColor,'
)
# Also apply to the dots (finding.palette.lightBg)
text = text.replace(
    'backgroundColor: finding.palette.lightBg,',
    'backgroundColor: finding.palette.lightBg, boxShadow: "inset 0 0 0 100px " + finding.palette.lightBg,'
)
text = text.replace(
    'backgroundColor: item.activeIndicatorColor }',
    'backgroundColor: item.activeIndicatorColor, boxShadow: "inset 0 0 0 100px " + item.activeIndicatorColor }'
)

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(text)
