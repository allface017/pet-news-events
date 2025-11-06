import * as cheerio from "cheerio";

export interface RawNewsItem {
  title: string;
  url: string;
  date: string;
  description?: string;
  imageUrl?: string;
  category?: string;  // イベント種別: "イベント", "お知らせ" など
}

export function parseNewsPage(html: string): RawNewsItem[] {
  const $ = cheerio.load(html);
  const items: RawNewsItem[] = [];

  // WAnco ニュースページの構造:
  // div.cFix > (dt + dd)
  // ※ dl要素がなく、div.cFixが各news itemを包括
  // イベント種別は dt > span.ico > img の alt 属性から取得
  
  $("div.cFix").each((_, divElem) => {
    const $div = $(divElem);
    
    // div直下のdt, ddを取得
    const dtElem = $div.find("> dt").first();
    const ddElem = $div.find("> dd").first();

    if (!dtElem.length || !ddElem.length) {
      return;
    }

    // イベント種別の抽出 (img alt属性)
    const categoryImg = dtElem.find("span.ico > img");
    const category = categoryImg.attr("alt") || undefined;

    // 日付の抽出
    const dateText = dtElem.text().trim();
    const dateMatch = dateText.match(/(\d{4})-(\d{2})-(\d{2})/);
    const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : dateText;

    // タイトルとURLの抽出
    const aElem = ddElem.find("a").first();
    if (!aElem.length) {
      return;
    }

    const title = aElem.text().trim();
    let url = aElem.attr("href");

    if (!title || !url) {
      return;
    }

    // URLを相対URLから絶対URLに変換
    try {
      if (!url.startsWith("http")) {
        url = new URL(url, "https://wanco.ac.jp").href;
      }
    } catch {
      return;
    }

    // 説明は記事リンクのテキストから生成
    const description = title.length > 100 ? title.slice(0, 100) + "..." : title;

    items.push({
      title,
      url,
      date,
      description,
      category,
      imageUrl: undefined,
    });
  });

  return items;
}
