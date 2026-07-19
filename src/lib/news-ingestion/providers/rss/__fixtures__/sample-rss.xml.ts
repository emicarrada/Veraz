export const SAMPLE_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Veraz Test Feed</title>
    <link>https://example.com</link>
    <language>en-us</language>
    <item>
      <title>First Article</title>
      <link>https://example.com/articles/first</link>
      <guid isPermaLink="true">guid-first-article</guid>
      <description><![CDATA[<p>Hello <strong>world</strong></p>]]></description>
      <pubDate>Mon, 01 Jan 2024 12:00:00 GMT</pubDate>
      <author>Jane Doe</author>
      <category>News</category>
      <enclosure url="https://example.com/image.jpg" type="image/jpeg" />
    </item>
    <item>
      <title>Second Article</title>
      <link>https://example.com/articles/second</link>
      <guid>guid-second-article</guid>
      <description>Plain excerpt</description>
      <pubDate>Tue, 02 Jan 2024 08:30:00 GMT</pubDate>
    </item>
    <item>
      <title>Media Thumbnail Article</title>
      <link>https://example.com/articles/media-thumb</link>
      <guid>guid-media-thumb-article</guid>
      <description><![CDATA[<p>Story with media thumbnail</p>]]></description>
      <pubDate>Wed, 03 Jan 2024 09:00:00 GMT</pubDate>
      <media:thumbnail url="https://example.com/thumb.jpg" />
    </item>
    <item>
      <title>Inline Image Article</title>
      <link>https://example.com/articles/inline-image</link>
      <guid>guid-inline-image-article</guid>
      <description><![CDATA[<p>Lead text</p><img src="https://example.com/inline.jpg" alt="Photo" />]]></description>
      <pubDate>Thu, 04 Jan 2024 10:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

export const FETCHED_AT = "2024-01-03T10:00:00.000Z";
