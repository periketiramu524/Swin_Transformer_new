import codecs

path = r'frontend/src/components/TaxonomyModal.tsx'
with codecs.open(path, 'r', 'utf-8', errors='ignore') as f:
    text = f.read()

# Replace unicode smart quotes, dashes, and the unicode replacement character
text = text.replace(u'\u2019', "'")
text = text.replace(u'\u2018', "'")
text = text.replace(u'\u2014', "-")
text = text.replace(u'\u2013', "-")
text = text.replace(u'\ufffd', "'")
text = text.replace(u'\u00a0', " ")

with codecs.open(path, 'w', 'utf-8') as f:
    f.write(text)
