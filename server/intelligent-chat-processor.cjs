/**
 * Интеллектуальный процессор чата - "невидимый мозг" приложения
 * Автоматически анализирует намерения пользователя и планирует оптимальный ответ
 * Работает прозрачно, как система принятия решений в ChatGPT-4
 */

const SmartLogger = {
  brain: (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`🧠 [${timestamp}] INTELLIGENT BRAIN: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  plan: (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`📋 [${timestamp}] ACTION PLAN: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  execute: (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`⚡ [${timestamp}] EXECUTION: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

// Сервисы будут импортированы динамически при необходимости

/**
 * Основная функция анализа намерений пользователя
 * Определяет что хочет пользователь и как лучше ответить
 */
async function analyzeUserIntent(userQuery, options = {}) {
  SmartLogger.brain(`Анализирую намерения пользователя: "${userQuery.substring(0, 100)}..."`);
  
  const query = userQuery.toLowerCase().trim();
  
  // Категории запросов с приоритетами
  const intentCategories = {
    // Высокий приоритет - специфические задачи
    vectorization: {
      priority: 95,
      keywords: ['векторизация', 'svg', 'свг', 'вектор', 'превратить в svg', 'конвертировать в svg', 'trace', 'трейс'],
      confidence: 0
    },
    
    image_generation: {
      priority: 90,
      keywords: ['нарисуй', 'создай изображение', 'сгенерируй', 'картинку', 'изображение', 'рисунок', 'фото', 'picture', 'image'],
      confidence: 0
    },
    
    embroidery: {
      priority: 85,
      keywords: ['вышивка', 'вышить', 'dst', 'pes', 'jef', 'exp', 'вышивальная машина', 'embroidery'],
      confidence: 0
    },
    
    // Средний приоритет - информационные запросы
    web_search: {
      priority: 70,
      keywords: ['что такое', 'найди', 'поищи', 'когда', 'где', 'кто', 'как', 'почему', 'погода', 'новости', 'курс', 'цена'],
      confidence: 0
    },
    
    time_date: {
      priority: 80,
      keywords: ['время', 'час', 'дата', 'число', 'сегодня', 'вчера', 'завтра'],
      confidence: 0
    },
    
    // Низкий приоритет - обычное общение
    conversation: {
      priority: 20,
      keywords: ['привет', 'как дела', 'спасибо', 'пока', 'хорошо', 'плохо', 'да', 'нет'],
      confidence: 0
    }
  };
  
  // Вычисляем уверенность для каждой категории
  for (const [category, data] of Object.entries(intentCategories)) {
    let matches = 0;
    let totalKeywords = data.keywords.length;
    
    for (const keyword of data.keywords) {
      if (query.includes(keyword)) {
        matches++;
      }
    }
    
    // Базовая уверенность от совпадений
    data.confidence = (matches / totalKeywords) * 100;
    
    // Улучшенная система бонусов
    if (matches > 0) {
      // Бонус за количество совпадений
      data.confidence += Math.min(matches * 15, 60);
      
      // Дополнительный бонус для поисковых запросов
      if (category === 'web_search' && matches >= 1) {
        data.confidence += 30;
      }
      
      // Бонус за длину совпадающих ключевых слов
      const totalMatchLength = data.keywords
        .filter(keyword => query.includes(keyword))
        .reduce((sum, keyword) => sum + keyword.length, 0);
      
      if (totalMatchLength > 10) {
        data.confidence += 20;
      }
    }
  }
  
  // Находим категорию с наивысшим приоритетом и уверенностью
  let bestCategory = 'conversation';
  let bestScore = 0;
  
  for (const [category, data] of Object.entries(intentCategories)) {
    const score = data.priority * (1 + data.confidence / 100);
    if (score > bestScore && data.confidence > 0) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  // Если никакая категория не подошла, используем умный анализ через AI
  if (bestScore === 0 || intentCategories[bestCategory].confidence < 5) {
    bestCategory = await analyzeWithAI(userQuery);
  }
  
  SmartLogger.brain(`Определена категория: ${bestCategory} (уверенность: ${intentCategories[bestCategory]?.confidence || 0}%)`);
  
  return {
    category: bestCategory,
    confidence: intentCategories[bestCategory]?.confidence || 0,
    query: userQuery,
    originalQuery: userQuery
  };
}

/**
 * AI-анализ для сложных или неоднозначных запросов
 */
async function analyzeWithAI(userQuery) {
  try {
    const analysisPrompt = `Проанализируй этот запрос пользователя и определи его тип:

Запрос: "${userQuery}"

Возможные типы:
- web_search: если нужна актуальная информация из интернета
- image_generation: если нужно создать/нарисовать изображение
- vectorization: если нужно конвертировать изображение в векторный формат
- embroidery: если связано с вышивкой или файлами для вышивальных машин
- time_date: если спрашивает время или дату
- conversation: если это обычное общение

Ответь только одним словом - типом запроса.`;

    const g4fProvider = require('./g4f-provider.js');
    const result = await g4fProvider.generateResponse(analysisPrompt, {
      provider: 'Qwen_Qwen_2_72B',
      max_tokens: 20
    });
    
    if (result.success && result.response) {
      const aiCategory = result.response.trim().toLowerCase();
      if (['web_search', 'image_generation', 'vectorization', 'embroidery', 'time_date', 'conversation'].includes(aiCategory)) {
        SmartLogger.brain(`AI определил категорию: ${aiCategory}`);
        return aiCategory;
      }
    }
  } catch (error) {
    SmartLogger.brain(`Ошибка AI анализа: ${error.message}`);
  }
  
  return 'conversation';
}

/**
 * Создание плана действий на основе намерений
 */
async function createActionPlan(intent, options = {}) {
  SmartLogger.plan(`Создаю план для категории: ${intent.category}`);
  
  const plans = {
    web_search: {
      steps: [
        'search_web',
        'analyze_results', 
        'format_response'
      ],
      description: 'Поиск актуальной информации и анализ результатов'
    },
    
    image_generation: {
      steps: [
        'optimize_prompt',
        'generate_image',
        'format_response'
      ],
      description: 'Генерация изображения по описанию'
    },
    
    vectorization: {
      steps: [
        'find_last_image',
        'vectorize_image',
        'format_response'
      ],
      description: 'Конвертация изображения в векторный формат'
    },
    
    embroidery: {
      steps: [
        'find_last_image',
        'convert_to_embroidery',
        'format_response'
      ],
      description: 'Конвертация в форматы для вышивки'
    },
    
    time_date: {
      steps: [
        'get_current_time',
        'format_response'
      ],
      description: 'Получение текущего времени и даты'
    },
    
    conversation: {
      steps: [
        'generate_conversation_response'
      ],
      description: 'Обычное общение с пользователем'
    }
  };
  
  const plan = plans[intent.category] || plans.conversation;
  
  SmartLogger.plan(`План создан: ${plan.description}`, { steps: plan.steps });
  
  return {
    category: intent.category,
    steps: plan.steps,
    description: plan.description,
    shouldExecute: true,
    confidence: intent.confidence
  };
}

/**
 * Выполнение плана действий
 */
async function executePlan(plan, userQuery, options = {}) {
  SmartLogger.execute(`Выполняю план: ${plan.description}`);
  
  try {
    switch (plan.category) {
      case 'web_search':
        return await executeWebSearchPlan(userQuery, options);
        
      case 'image_generation':
        return await executeImageGenerationPlan(userQuery, options);
        
      case 'vectorization':
        return await executeVectorizationPlan(userQuery, options);
        
      case 'embroidery':
        return await executeEmbroideryPlan(userQuery, options);
        
      case 'time_date':
        return await executeTimeDatePlan(userQuery, options);
        
      case 'conversation':
        return await executeConversationPlan(userQuery, options);
        
      default:
        return { success: false, shouldFallback: true };
    }
  } catch (error) {
    SmartLogger.execute(`Ошибка выполнения плана: ${error.message}`);
    return { success: false, shouldFallback: true, error: error.message };
  }
}

/**
 * Выполнение плана веб-поиска
 */
async function executeWebSearchPlan(userQuery, options) {
  SmartLogger.execute(`Выполняю веб-поиск для: "${userQuery}"`);
  
  try {
    const { default: webSearchProvider } = await import('./web-search-provider.js');
    const searchResult = await webSearchProvider.performAdvancedSearch(userQuery, {
      language: 'ru',
      maxResults: 8,
      includeAIProcessing: true
    });
    
    if (searchResult.success && searchResult.aiProcessedAnswer) {
      return {
        success: true,
        response: searchResult.aiProcessedAnswer,
        provider: 'IntelligentWebSearch',
        category: 'web_search',
        searchUsed: true,
        sources: searchResult.sources?.slice(0, 3) || []
      };
    }
    
    return { success: false, shouldFallback: true };
  } catch (error) {
    SmartLogger.execute(`Ошибка веб-поиска: ${error.message}`);
    return { success: false, shouldFallback: true };
  }
}

/**
 * Выполнение плана генерации изображений
 */
async function executeImageGenerationPlan(userQuery, options) {
  SmartLogger.execute(`Выполняю генерацию изображения для: "${userQuery}"`);
  
  try {
    // Оптимизируем промпт для лучшего качества
    const optimizedPrompt = await optimizeImagePrompt(userQuery);
    
    const { default: aiImageGenerator } = await import('./ai-image-generator.js');
    const imageResult = await aiImageGenerator.generateImage(optimizedPrompt, {
      style: 'realistic',
      quality: 'high'
    });
    
    if (imageResult.success && imageResult.imageUrl) {
      const response = `Изображение создано! 

![Сгенерированное изображение](${imageResult.imageUrl})

🎨 **Стиль:** Реалистичный
📐 **Размер:** 1024x1024
🖼️ **Качество:** Высокое

Если нужно что-то изменить, просто опишите что хотите поправить.`;

      return {
        success: true,
        response: response,
        provider: 'IntelligentImageGenerator',
        category: 'image_generation',
        imageGenerated: true,
        imageUrl: imageResult.imageUrl
      };
    }
    
    return { success: false, shouldFallback: true };
  } catch (error) {
    SmartLogger.execute(`Ошибка генерации изображения: ${error.message}`);
    return { success: false, shouldFallback: true };
  }
}

/**
 * Оптимизация промпта для генерации изображений
 */
async function optimizeImagePrompt(userQuery) {
  try {
    const optimizationPrompt = `Улучши этот промпт для генерации изображения:

Исходный запрос: "${userQuery}"

Создай детальный промпт на английском языке для AI генератора изображений. Добавь детали о:
- Стиле и качестве
- Освещении и композиции
- Цветах и настроении
- Технических параметрах

Ответь только улучшенным промптом без пояснений.`;

    const g4fProvider = require('./g4f-provider.js');
    const result = await g4fProvider.generateResponse(optimizationPrompt, {
      provider: 'Qwen_Qwen_2_72B',
      max_tokens: 150
    });
    
    if (result.success && result.response) {
      SmartLogger.execute(`Промпт оптимизирован: ${result.response.substring(0, 100)}...`);
      return result.response.trim();
    }
  } catch (error) {
    SmartLogger.execute(`Ошибка оптимизации промпта: ${error.message}`);
  }
  
  return userQuery;
}

/**
 * Выполнение плана векторизации
 */
async function executeVectorizationPlan(userQuery, options) {
  SmartLogger.execute(`Выполняю векторизацию изображения`);
  
  // Этот план будет выполняться через fallback к smart-router
  return { success: false, shouldFallback: true };
}

/**
 * Выполнение плана конвертации в вышивку
 */
async function executeEmbroideryPlan(userQuery, options) {
  SmartLogger.execute(`Выполняю конвертацию в вышивку`);
  
  // Этот план будет выполняться через fallback к smart-router
  return { success: false, shouldFallback: true };
}

/**
 * Выполнение плана получения времени
 */
async function executeTimeDatePlan(userQuery, options) {
  SmartLogger.execute(`Получаю текущее время и дату`);
  
  const now = new Date();
  const timeStr = now.toLocaleString('ru-RU', { 
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'long'
  });
  
  return {
    success: true,
    response: `Сейчас: ${timeStr} (московское время)`,
    provider: 'IntelligentTimeProvider',
    category: 'time_date'
  };
}

/**
 * Выполнение плана обычного общения
 */
async function executeConversationPlan(userQuery, options) {
  SmartLogger.execute(`Генерирую ответ для обычного общения`);
  
  try {
    const conversationPrompt = `Ты дружелюбный AI-помощник. Ответь естественно на сообщение пользователя:

Пользователь: "${userQuery}"

Ответь дружелюбно и по существу. Если можешь помочь чем-то конкретным, предложи это.`;

    const g4fProvider = require('./g4f-provider.js');
    const result = await g4fProvider.generateResponse(conversationPrompt, {
      provider: 'Qwen_Qwen_2_72B',
      max_tokens: 200
    });
    
    if (result.success && result.response) {
      return {
        success: true,
        response: result.response.trim(),
        provider: 'IntelligentConversation',
        category: 'conversation'
      };
    }
    
    return { success: false, shouldFallback: true };
  } catch (error) {
    SmartLogger.execute(`Ошибка генерации разговора: ${error.message}`);
    return { success: false, shouldFallback: true };
  }
}

/**
 * Главная функция интеллектуального процессора
 * Анализирует запрос и выполняет оптимальный план действий
 */
async function analyzeAndExecute(userQuery, options = {}) {
  SmartLogger.brain(`=== ЗАПУСК ИНТЕЛЛЕКТУАЛЬНОГО АНАЛИЗА ===`);
  SmartLogger.brain(`Запрос: "${userQuery}"`);
  
  try {
    // Шаг 1: Анализ намерений
    const intent = await analyzeUserIntent(userQuery, options);
    
    // Шаг 2: Создание плана
    const plan = await createActionPlan(intent, options);
    
    // Шаг 3: Выполнение плана
    if (plan.shouldExecute && plan.confidence > 15) {
      const result = await executePlan(plan, userQuery, options);
      
      if (result.success) {
        SmartLogger.brain(`=== УСПЕШНОЕ ВЫПОЛНЕНИЕ ПЛАНА ===`);
        return result;
      } else if (result.shouldFallback) {
        SmartLogger.brain(`=== ПЕРЕХОД К СТАНДАРТНОЙ ЛОГИКЕ ===`);
        return { success: false, shouldFallback: true };
      }
    }
    
    // Если план не подходит, используем стандартную логику
    SmartLogger.brain(`=== НИЗКАЯ УВЕРЕННОСТЬ, ПЕРЕХОД К СТАНДАРТНОЙ ЛОГИКЕ ===`);
    return { success: false, shouldFallback: true };
    
  } catch (error) {
    SmartLogger.brain(`=== ОШИБКА АНАЛИЗА: ${error.message} ===`);
    return { success: false, shouldFallback: true, error: error.message };
  }
}

module.exports = {
  analyzeAndExecute,
  analyzeUserIntent,
  createActionPlan,
  executePlan
};