// 简单的基于关键词的向量搜索
// 不需要外部模型，直接使用 TF-IDF -like 算法

let documentsStore = [];

/**
 * 初始化（无需外部依赖）
 */
async function initializeVectorStore() {
  console.log('✅ 搜索引擎初始化完成');
  return true;
}

/**
 * 简单分词
 */
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);
}

/**
 * 计算词频权重
 */
function computeWordWeights(text) {
  const tokens = tokenize(text);
  const weights = {};
  
  for (const token of tokens) {
    weights[token] = (weights[token] || 0) + 1;
  }
  
  return weights;
}

/**
 * 为文档生成索引
 */
async function embedDocuments(documents) {
  console.log(`🔄 正在索引 ${documents.length} 个文档...`);

  documentsStore = documents.map(doc => ({
    ...doc,
    wordWeights: computeWordWeights(doc.content)
  }));

  console.log(`✅ 已索引 ${documents.length} 个文档`);
}

/**
 * 计算相关性分数
 */
function computeScore(queryWeights, docWeights) {
  let score = 0;
  
  for (const word in queryWeights) {
    if (docWeights[word]) {
      // 文档中包含查询词
      score += queryWeights[word] * docWeights[word];
      
      // 标题匹配加权
      if (docWeights[`title_${word}`]) {
        score += 5;
      }
    }
  }
  
  return score;
}

/**
 * 相似度搜索
 */
async function similaritySearch(query, topK = 5) {
  const queryWeights = computeWordWeights(query);
  const queryTokens = tokenize(query);
  
  // 计算每个文档的相关性分数
  const results = documentsStore.map(doc => {
    // 检查查询词是否在文档中
    const matchedTokens = queryTokens.filter(token => 
      doc.content.toLowerCase().includes(token) || 
      doc.title?.toLowerCase().includes(token)
    );
    
    const matchRatio = matchedTokens.length / queryTokens.length;
    const score = computeScore(queryWeights, doc.wordWeights) * (0.5 + matchRatio * 0.5);

    return {
      content: doc.content,
      metadata: {
        source: doc.source,
        title: doc.title,
        ...doc.metadata
      },
      score
    };
  });

  // 过滤掉不相关的文档
  const filtered = results.filter(r => r.score > 0);
  
  // 按分数排序
  filtered.sort((a, b) => b.score - a.score);

  return filtered.slice(0, topK);
}

/**
 * 清空知识库
 */
async function clearKnowledgeBase() {
  documentsStore = [];
  console.log('✅ 知识库已清空');
}

/**
 * 获取知识库统计信息
 */
async function getStats() {
  return { documentCount: documentsStore.length };
}

module.exports = {
  initializeVectorStore,
  embedDocuments,
  similaritySearch,
  clearKnowledgeBase,
  getStats
};
