# Test Zenzic Errors

## Z101 - Broken Link
[Broken Link to Nowhere](missing_page.md)

## Z102 - Missing Anchor
[Link to missing anchor](#this-anchor-does-not-exist)

## Z104 - Malformed URL
[Malformed URL](http://[2001:db8::1]/path)

## Z105 - Circular Anchor
[Link to itself](#z105---circular-anchor)

## Z107 - Untagged Code Block
```
echo "This code block has no language specified"
```

## Z108 - Empty Link Text
[](#z108---empty-link-text)

## Z201 - Credential Leak
My AWS Key is AKIAIOSFODNN7EXAMPLE

## Z403 - Missing Alt Text
![](https://example.com/image.png)
<img src="https://example.com/image.png">

## Z501 - Malformed Frontmatter
(If this was at the top of the file without a closing tag)

## Z601 - Brand Obsolescence
(Needs config for obsolete brands)

## Z603 - Dead Suppression
<!-- zenzic:ignore Z999 -->
(Since Z999 does not exist or isn't triggered here)

## Z204 - Forbidden Term
(Needs config for forbidden terms)
