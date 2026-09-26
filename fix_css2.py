import codecs

path = r'frontend/src/routes/results.tsx'
with codecs.open(path, 'r', 'utf-8') as f:
    text = f.read()

text = text.replace(
    'backgroundColor: finding.activeIndicatorColor, boxShadow: "inset 0 0 0 100px " + finding.activeIndicatorColor, borderRight: "2px solid " + finding.activeIndicatorColor,',
    'backgroundColor: finding.activeIndicatorColor, borderBottom: "16px solid " + finding.activeIndicatorColor,'
)

text = text.replace(
    'backgroundColor: item.activeIndicatorColor, boxShadow: "inset 0 0 0 100px " + item.activeIndicatorColor, borderRight: "2px solid " + item.activeIndicatorColor',
    'backgroundColor: item.activeIndicatorColor, borderBottom: "16px solid " + item.activeIndicatorColor'
)

# For the small dots
text = text.replace(
    'backgroundColor: item.activeIndicatorColor, boxShadow: "inset 0 0 0 100px " + item.activeIndicatorColor, borderRight: "2px solid " + item.activeIndicatorColor',
    'backgroundColor: item.activeIndicatorColor, borderBottom: "12px solid " + item.activeIndicatorColor'
)
text = text.replace(
    'backgroundColor: item.activeIndicatorColor, boxShadow: "inset 0 0 0 100px " + item.activeIndicatorColor }',
    'backgroundColor: item.activeIndicatorColor, borderBottom: "12px solid " + item.activeIndicatorColor }'
)
# For finding.palette.lightBg (the icons background)
text = text.replace(
    'backgroundColor: finding.palette.lightBg, boxShadow: "inset 0 0 0 100px " + finding.palette.lightBg,',
    'backgroundColor: finding.palette.lightBg, borderBottom: "40px solid " + finding.palette.lightBg,'
)

# Fix some encoding artifacts in results.tsx that showed up in my grep: "â€¢", "âœ•"
text = text.replace(u'\u00e2\u20ac\u00a2', u'\u2022') # bullet
text = text.replace(u'\u00e2\u0153\u2022', u'\u2715') # cross
text = text.replace('â€¢', u'\u2022') # bullet
text = text.replace('âœ•', u'\u2715') # cross

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(text)
