interface ModerationResult {
  isSafe: boolean;
  category?: "spam" | "abuse" | "clean";
  reason?: string;
}

const SPAM_PATTERNS = [/广告/g, /加微信/g, /免费领取/g, /点击链接/g, /兼职/g, /日赚/g];
const ABUSE_PATTERNS = [/傻逼/g, /fuck/gi, /操你/g, /妈的/g, /tmd/gi];

export async function moderateContent(content: string): Promise<ModerationResult> {
  if (process.env.OPENAI_API_KEY) {
    return callOpenAIModeration(content);
  }

  return keywordModeration(content);
}

function keywordModeration(content: string): ModerationResult {
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      return { isSafe: false, category: "spam", reason: "疑似垃圾广告" };
    }
  }

  for (const pattern of ABUSE_PATTERNS) {
    if (pattern.test(content)) {
      return { isSafe: false, category: "abuse", reason: "包含不文明用语" };
    }
  }

  return { isSafe: true, category: "clean" };
}

async function callOpenAIModeration(content: string): Promise<ModerationResult> {
  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({ input: content }),
    });
    const data = await response.json();
    const result = data.results?.[0];
    if (result?.flagged) {
      return {
        isSafe: false,
        category: "abuse",
        reason: "内容审核未通过（AI 检测）",
      };
    }
    return { isSafe: true, category: "clean" };
  } catch {
    return keywordModeration(content);
  }
}
