
/**
 * Система улучшения качества ответов для конкуренции с ChatGPT-4
 */

class ResponseQualityEnhancer {
  constructor() {
    this.qualityFilters = new Map();
    this.responseCache = new Map();
  }

  /**
   * Улучшает качество ответа через несколько фильтров
   */
  async enhanceResponse(response, context = {}) {
    let enhanced = response;

    // 1. Фильтр связности и логики
    enhanced = this.improveCoherence(enhanced);

    // 2. Фильтр грамматики и стиля
    enhanced = this.improveGrammar(enhanced);

    // 3. Фильтр релевантности контексту
    enhanced = this.improveRelevance(enhanced, context);

    // 4. Фильтр полноты ответа
    enhanced = this.improveCompleteness(enhanced, context);

    return enhanced;
  }

  /**
   * Улучшает связность ответа
   */
  improveCoherence(response) {
    // Удаляем повторения
    const sentences = response.split(/[.!?]+/).filter(s => s.trim());
    const uniqueSentences = [...new Set(sentences.map(s => s.trim()))];
    
    // Добавляем логические связки
    return uniqueSentences
      .map((sentence, index) => {
        if (index === 0) return sentence;
        
        // Добавляем связки между предложениями
        const connectors = ['Кроме того,', 'Также', 'При этом', 'Важно отметить, что'];
        if (Math.random() > 0.7 && sentence.length > 20) {
          return connectors[Math.floor(Math.random() * connectors.length)] + ' ' + sentence.toLowerCase();
        }
        return sentence;
      })
      .join('. ') + '.';
  }

  /**
   * Улучшает грамматику и стиль
   */
  improveGrammar(response) {
    return response
      .replace(/\s+/g, ' ') // Убираем лишние пробелы
      .replace(/([.!?])\s*([а-яё])/gi, '$1 $2') // Пробелы после знаков препинания
      .replace(/\b(и|но|или|а)\s*,/gi, '$1,') // Запятые после союзов
      .trim();
  }

  /**
   * Улучшает релевантность контексту
   */
  improveRelevance(response, context) {
    if (!context.userQuery) return response;

    const query = context.userQuery.toLowerCase();
    
    // Если ответ не содержит ключевых слов из запроса, добавляем их
    const keywords = query.split(' ').filter(word => word.length > 3);
    const hasRelevantKeywords = keywords.some(keyword => 
      response.toLowerCase().includes(keyword)
    );

    if (!hasRelevantKeywords && keywords.length > 0) {
      return `Отвечая на ваш вопрос о ${keywords[0]}: ${response}`;
    }

    return response;
  }

  /**
   * Улучшает полноту ответа
   */
  improveCompleteness(response, context) {
    // Если ответ слишком короткий, добавляем дополнительную информацию
    if (response.length < 100) {
      return response + '\n\nЕсли у вас есть дополнительные вопросы по этой теме, буду рад помочь!';
    }

    // Если ответ не содержит примеров, предлагаем их
    if (!response.includes('например') && !response.includes('пример')) {
      return response + '\n\nМогу привести конкретные примеры, если это будет полезно.';
    }

    return response;
  }
}

module.exports = ResponseQualityEnhancer;
