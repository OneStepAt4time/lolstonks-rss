# Multi-Language RSS Feed Guide

## Overview

The LoL Stonks RSS supports all 20 official Riot Games locales with native language feed titles and descriptions.

## Supported Locales

### English
- **en-us** - English (United States)
- **en-gb** - English (Great Britain)

### European Languages
- **es-es** - Spanish (Spain)
- **es-mx** - Spanish (Latin America)
- **fr-fr** - French
- **de-de** - German
- **it-it** - Italian
- **pt-br** - Portuguese (Brazil)
- **pl-pl** - Polish

### Asian Languages
- **ja-jp** - Japanese
- **ko-kr** - Korean
- **zh-cn** - Chinese Simplified
- **zh-tw** - Chinese Traditional
- **vi-vn** - Vietnamese
- **th-th** - Thai
- **id-id** - Indonesian
- **ph-ph** - Filipino

### Other Languages
- **ru-ru** - Russian
- **tr-tr** - Turkish
- **ar-ae** - Arabic

## API Endpoints

### Locale-Specific Feed
```
GET /rss/{locale}.xml
```

Example: `/rss/ja-jp.xml` - Japanese RSS feed

### Source-Filtered Locale Feed
```
GET /rss/{locale}/{source}.xml
```

Example: `/rss/ja-jp/lol.xml` - Japanese LoL official news only

### Category-Filtered Locale Feed
```
GET /rss/{locale}/category/{category}.xml
```

Example: `/rss/en-us/category/patch-notes.xml` - English patch notes only

### Feed Discovery
```
GET /feeds
```

Lists all available feeds with metadata.

## Usage Examples

### Basic Feed Request

Get Japanese RSS feed:
```bash
curl https://your-server.com/rss/ja-jp.xml
```

Get Korean RSS feed:
```bash
curl https://your-server.com/rss/ko-kr.xml
```

### RSS Reader Configuration

**Feedly:**
1. Add new feed
2. Enter: `https://your-server.com/rss/ja-jp.xml`
3. Subscribe

**Inoreader:**
1. Add subscription
2. Enter: `https://your-server.com/rss/ko-kr.xml`
3. Subscribe

**NetNewsWire:**
1. File → Add Feed
2. Enter: `https://your-server.com/rss/zh-cn.xml`
3. Subscribe

## Localization Features

Each locale feed includes:
- **Localized Title** - Feed title in native language
- **Localized Description** - Feed description in native language
- **UTF-8 Encoding** - Full Unicode support for all characters
- **Language Attribute** - Proper RSS `<language>` tag

### Example: Japanese Feed
```xml
<rss version="2.0">
  <channel>
    <title>リーグ・オブ・レジェンド ニュース</title>
    <description>リーグ・オブ・レジェンドの最新ニュースとアップデート</description>
    <language>ja</language>
    ...
  </channel>
</rss>
```

### Example: Korean Feed
```xml
<rss version="2.0">
  <channel>
    <title>리그 오브 레전드 뉴스</title>
    <description>리그 오브 레전드 최신 뉴스 및 업데이트</description>
    <language>ko</language>
    ...
  </channel>
</rss>
```

## Character Encoding

All feeds use UTF-8 encoding to support:

### CJK Languages (Chinese, Japanese, Korean)
- Japanese: Kanji, Hiragana, Katakana
- Korean: Hangul syllables
- Chinese: Simplified and Traditional characters

### Other Scripts
- Arabic: Right-to-left text (مرحبا)
- Thai: Thai script (สวัสดี)
- Vietnamese: Latin with diacritics

### European Languages
- Full accent support (é, ñ, ü, etc.)
- Special characters (ß, ø, etc.)

## Supported Language Codes

Riot locale codes map to RSS language codes:

| Riot Locale | RSS Code | Language |
|-------------|----------|----------|
| en-us | en | English (US) |
| en-gb | en-gb | English (UK) |
| es-es | es | Spanish (Spain) |
| es-mx | es-mx | Spanish (Mexico) |
| fr-fr | fr | French |
| de-de | de | German |
| it-it | it | Italian |
| pt-br | pt-br | Portuguese (Brazil) |
| ru-ru | ru | Russian |
| tr-tr | tr | Turkish |
| pl-pl | pl | Polish |
| ja-jp | ja | Japanese |
| ko-kr | ko | Korean |
| zh-cn | zh-cn | Chinese (Simplified) |
| zh-tw | zh-tw | Chinese (Traditional) |
| ar-ae | ar | Arabic |
| vi-vn | vi | Vietnamese |
| th-th | th | Thai |
| id-id | id | Indonesian |
| ph-ph | tl | Filipino |

## Configuration

### Server-Side Configuration

Set supported locales via environment variable:

```env
# Support all locales (default)
SUPPORTED_LOCALES=en-us,en-gb,es-es,es-mx,fr-fr,de-de,it-it,pt-br,ru-ru,tr-tr,pl-pl,ja-jp,ko-kr,zh-cn,zh-tw,ar-ae,vi-vn,th-th,id-id,ph-ph

# Or support subset
SUPPORTED_LOCALES=en-us,ja-jp,ko-kr,it-it
```

## Troubleshooting

### Feed Shows Garbled Characters
**Problem:** CJK or Arabic characters display as boxes

**Solution:**
1. Verify RSS reader supports UTF-8
2. Check feed encoding: `curl {feed_url} | file -`
3. Try different RSS reader

### Feed Returns 404
**Problem:** Locale not supported

**Solution:**
1. Check locale code is correct (e.g., `ja-jp` not `jp`)
2. Verify server configuration
3. Check `/feeds` endpoint for available locales

## Best Practices

- Always use full locale codes (e.g., `zh-cn`, not `zh`)
- Test feed in multiple RSS readers
- Verify UTF-8 encoding before publishing

## Additional Resources

- [RSS 2.0 Specification](https://www.rssboard.org/rss-specification)
- [Riot Games Locales](https://www.riotgames.com/en/regions)
