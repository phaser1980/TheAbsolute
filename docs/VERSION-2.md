# The Absolute — Version 2.0

Version 2 makes the archival discontinuity the centre of the investigation rather than a footnote.

## Confirmed from the supplied CIA PDF

- The file contains 29 scanned PDF pages.
- PDF scan 26 is internally numbered report page 24.
- Paragraph 34 ends mid-sentence on that page.
- The next scanned sheet, PDF scan 27, is internally numbered report page 26.
- It begins at paragraph 37, `Motivational Aspect`.
- Internal page 25, the continuation of paragraph 34, and paragraphs 35–36 are absent from this release.

## Product changes

- Dedicated **Missing Page Case File** section.
- Explicit distinction between PDF scan numbering and internal report numbering.
- Clear separation between what the file proves and hypotheses about why the leaf is absent.
- A case-note button that opens the private local journal.
- Automatic preference for a locally hosted source PDF when present.

## Required source upload

The GitHub connector can write the website code but cannot transfer the uploaded binary PDF into the repository. Upload the supplied PDF through GitHub at this exact path:

```text
assets/source/gateway-process.pdf
```

The filename and case must match exactly.

Once present, `js/v2.js` detects it automatically and:

- replaces CIA links with the local archive;
- loads each page from the same-origin PDF;
- removes the CIA iframe refusal;
- labels the viewer **Local archive**;
- points the missing-page inspection link at PDF scan 26.

Until the file is uploaded, the live site continues using direct CIA links and shows a setup note rather than breaking.

## Provenance rule

Any recovered version of internal page 25 should only be incorporated with documented provenance: source holder, original image, custody history, publication history, and confidence assessment. A transcription alone should not silently replace the missing leaf.
