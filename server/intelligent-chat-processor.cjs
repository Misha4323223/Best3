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
  },
  grammar: (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`📝 [${timestamp}] GRAMMAR ANALYSIS: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  memory: (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`💾 [${timestamp}] ACTION MEMORY: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  emotion: (message, data) => {
    const timestamp = new Date().toISOString();
    console.log(`😊 [${timestamp}] EMOTIONAL ANALYSIS: ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

/**
 * Система эмоционального анализа и адаптивных ответов
 */
const emotionalAnalyzer = {
  // Словари для определения эмоций
  emotionPatterns: {
    // Позитивные эмоции
    joy: {
      keywords: ['отлично', 'супер', 'классно', 'круто', 'замечательно', 'прекрасно', 'восторг', 'радость', 'счастлив', 'довольн', 'ура', 'ого', 'вау', 'amazing', 'great', 'awesome', 'fantastic', 'wonderful'],
      emojis: ['😊', '😄', '🎉', '👍', '💯', '✨', '🌟', '❤️'],
      weight: 2
    },
    
    // Злость/раздражение
    anger: {
      keywords: ['бесит', 'злой', 'раздражает', 'дурак', 'идиот', 'ненавижу', 'достал', 'надоел', 'плохо', 'ужасно', 'отвратительно', 'фигня', 'дерьмо', 'блин', 'черт', 'angry', 'hate', 'stupid', 'terrible', 'awful'],
      emojis: ['😤', '😠', '💢', '🤬', '😡'],
      weight: 3
    },
    
    // Усталость/грусть
    sadness: {
      keywords: ['устал', 'грустно', 'печально', 'депрессия', 'скучно', 'одиноко', 'тоскливо', 'плохое настроение', 'не хочется', 'лень', 'sad', 'tired', 'boring', 'lonely', 'depressed'],
      emojis: ['😔', '😞', '😢', '😴', '💤', '😪'],
      weight: 2
    },
    
    // Удивление/интерес
    surprise: {
      keywords: ['удивительно', 'невероятно', 'интересно', 'любопытно', 'странно', 'необычно', 'как так', 'неожиданно', 'wow', 'amazing', 'incredible', 'interesting', 'curious', 'strange'],
      emojis: ['😮', '🤔', '😯', '🧐', '💭', '❓'],
      weight: 1.5
    },
    
    // Вежливость
    polite: {
      keywords: ['пожалуйста', 'спасибо', 'благодарю', 'извините', 'простите', 'будьте добры', 'не могли бы', 'please', 'thank you', 'sorry', 'excuse me'],
      emojis: ['🙏', '😊', '💝', '🤝'],
      weight: 1.5
    },
    
    // Нейтральные вопросы
    neutral_question: {
      keywords: ['что', 'как', 'где', 'когда', 'почему', 'зачем', 'можешь', 'помоги', 'объясни', 'расскажи', 'what', 'how', 'where', 'when', 'why', 'help', 'explain'],
      emojis: ['❓', '🤔', '💭'],
      weight: 1
    }
  },

  /**
   * Анализ эмоциональной тональности текста
   */
  analyzeEmotion(text) {
    SmartLogger.emotion(`Анализируем эмоции в тексте: "${text.substring(0, 50)}..."`);
    
    const lowerText = text.toLowerCase();
    const emotions = {};
    let dominantEmotion = 'neutral';
    let maxScore = 0;
    
    // Анализируем каждую эмоцию
    for (const [emotion, data] of Object.entries(this.emotionPatterns)) {
      let score = 0;
      const matches = [];
      
      // Подсчитываем совпадения
      for (const keyword of data.keywords) {
        if (lowerText.includes(keyword)) {
          score += data.weight;
          matches.push(keyword);
        }
      }
      
      emotions[emotion] = {
        score,
        matches,
        confidence: Math.min(score * 20, 100) // Нормализуем до 100%
      };
      
      // Определяем доминирующую эмоцию
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    }
    
    // Дополнительный анализ на основе пунктуации и стиля
    const punctuationAnalysis = this.analyzePunctuation(text);
    const styleAnalysis = this.analyzeWritingStyle(text);
    
    const result = {
      dominantEmotion,
      emotions,
      confidence: emotions[dominantEmotion]?.confidence || 0,
      punctuation: punctuationAnalysis,
      style: styleAnalysis,
      overallTone: this.determineOverallTone(emotions, punctuationAnalysis, styleAnalysis)
    };
    
    SmartLogger.emotion('Результат эмоционального анализа:', result);
    return result;
  },

  /**
   * Анализ пунктуации для определения эмоций
   */
  analyzePunctuation(text) {
    const analysis = {
      exclamationMarks: (text.match(/!/g) || []).length,
      questionMarks: (text.match(/\?/g) || []).length,
      capsWords: (text.match(/[А-ЯA-Z]{2,}/g) || []).length,
      dots: (text.match(/\.{2,}/g) || []).length
    };
    
    // Интерпретация
    let interpretation = 'neutral';
    if (analysis.exclamationMarks >= 2) interpretation = 'excited';
    else if (analysis.capsWords >= 2) interpretation = 'angry_or_excited';
    else if (analysis.dots >= 1) interpretation = 'thoughtful_or_sad';
    else if (analysis.questionMarks >= 2) interpretation = 'confused_or_curious';
    
    return { ...analysis, interpretation };
  },

  /**
   * Анализ стиля письма
   */
  analyzeWritingStyle(text) {
    const wordCount = text.split(/\s+/).length;
    const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
    const sentenceCount = text.split(/[.!?]+/).length - 1;
    
    return {
      wordCount,
      avgWordLength,
      sentenceCount,
      isLongMessage: wordCount > 20,
      isShortMessage: wordCount < 5,
      formality: avgWordLength > 5 ? 'formal' : 'casual'
    };
  },

  /**
   * Определение общей тональности
   */
  determineOverallTone(emotions, punctuation, style) {
    const scores = Object.entries(emotions)
      .filter(([_, data]) => data.score > 0)
      .sort((a, b) => b[1].score - a[1].score);
    
    if (scores.length === 0) return 'neutral';
    
    const topEmotion = scores[0][0];
    const confidence = scores[0][1].confidence;
    
    // Модификаторы на основе пунктуации
    let modifier = '';
    if (punctuation.interpretation === 'excited' && topEmotion !== 'anger') {
      modifier = '_excited';
    } else if (punctuation.interpretation === 'angry_or_excited' && confidence > 50) {
      modifier = '_intense';
    }
    
    return topEmotion + modifier;
  },

  /**
   * Генерация адаптивного ответа на основе эмоций
   */
  generateEmotionalResponse(emotionalState, baseResponse, category) {
    SmartLogger.emotion(`Адаптируем ответ под эмоцию: ${emotionalState.dominantEmotion}`);
    
    const templates = this.getResponseTemplates(emotionalState.overallTone, category);
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    // Добавляем эмодзи
    const emoji = this.selectEmoji(emotionalState.dominantEmotion);
    
    // Формируем финальный ответ
    let adaptedResponse = selectedTemplate.prefix + ' ' + baseResponse;
    
    if (selectedTemplate.suffix) {
      adaptedResponse += ' ' + selectedTemplate.suffix;
    }
    
    if (emoji) {
      adaptedResponse = emoji + ' ' + adaptedResponse;
    }
    
    SmartLogger.emotion(`Адаптированный ответ: "${adaptedResponse.substring(0, 100)}..."`);
    return adaptedResponse;
  },

  /**
   * Шаблоны ответов для разных эмоций
   */
  getResponseTemplates(tone, category) {
    const templates = {
      joy: [
        { prefix: 'Отлично! С радостью помогу!', suffix: 'Надеюсь, результат вас порадует! 🎉' },
        { prefix: 'Замечательно! Это будет интересно!', suffix: 'Уверен, получится здорово! ✨' },
        { prefix: 'Супер! Давайте сделаем это!', suffix: 'Думаю, вам понравится результат! 🌟' }
      ],
      
      anger: [
        { prefix: 'Понимаю ваше раздражение. Давайте решим это быстро.', suffix: 'Надеюсь, это поможет улучшить ситуацию.' },
        { prefix: 'Извините за неудобства. Сейчас всё исправим.', suffix: 'Постараюсь сделать всё максимально эффективно.' },
        { prefix: 'Вижу, что вы расстроены. Попробуем решить проблему.', suffix: 'Надеюсь, это поможет.' }
      ],
      
      sadness: [
        { prefix: 'Понимаю, что сейчас непросто. Давайте попробуем.', suffix: 'Надеюсь, это немного поднимет настроение! 🌈' },
        { prefix: 'Не расстраивайтесь, мы обязательно справимся.', suffix: 'Всё будет хорошо! 💝' },
        { prefix: 'Поддерживаю вас! Вместе мы решим эту задачу.', suffix: 'Верю, что у нас получится! 🤗' }
      ],
      
      surprise: [
        { prefix: 'Интересная задача! Давайте разберёмся.', suffix: 'Любопытно посмотреть, что получится! 🔍' },
        { prefix: 'Необычный запрос! Попробуем сделать что-то особенное.', suffix: 'Это будет познавательно! 🧐' },
        { prefix: 'Отличный вопрос! Сейчас всё выясним.', suffix: 'Результат может вас удивить! ✨' }
      ],
      
      polite: [
        { prefix: 'Конечно! Буду рад помочь.', suffix: 'Если нужно что-то ещё, обращайтесь! 🤝' },
        { prefix: 'С удовольствием! Сейчас сделаю.', suffix: 'Благодарю за вежливость! 😊' },
        { prefix: 'Разумеется! Приступаю к выполнению.', suffix: 'Рад быть полезным! 🙏' }
      ],
      
      neutral_question: [
        { prefix: 'Хороший вопрос! Давайте разберёмся.', suffix: 'Надеюсь, ответ будет полезным! 💭' },
        { prefix: 'Понятно! Сейчас найдём решение.', suffix: 'Постараюсь дать исчерпывающий ответ! 🎯' },
        { prefix: 'Ясно! Приступаю к анализу.', suffix: 'Думаю, это поможет! 📋' }
      ],
      
      neutral: [
        { prefix: 'Хорошо! Сейчас выполню.', suffix: 'Готово! Если нужно что-то ещё, обращайтесь.' },
        { prefix: 'Понятно! Приступаю к работе.', suffix: 'Надеюсь, результат вам подойдёт!' },
        { prefix: 'Сейчас сделаю!', suffix: 'Готово к использованию!' }
      ]
    };
    
    return templates[tone] || templates.neutral;
  },

  /**
   * Выбор подходящего эмодзи
   */
  selectEmoji(emotion) {
    const emojiSets = this.emotionPatterns[emotion]?.emojis || ['🤖'];
    return emojiSets[Math.floor(Math.random() * emojiSets.length)];
  }
};

// Система памяти о последних действиях
const actionMemory = {
  lastActions: [],
  maxHistorySize: 10,

  // Сохранить действие в памяти
  saveAction(action) {
    const actionRecord = {
      ...action,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.lastActions.unshift(actionRecord);
    
    // Ограничиваем размер истории
    if (this.lastActions.length > this.maxHistorySize) {
      this.lastActions = this.lastActions.slice(0, this.maxHistorySize);
    }
    
    SmartLogger.memory(`Сохранено действие: ${action.category}`, actionRecord);
  },

  // Получить последнее действие определенного типа
  getLastAction(category = null) {
    if (!category) {
      return this.lastActions[0] || null;
    }
    
    const lastAction = this.lastActions.find(action => action.category === category);
    SmartLogger.memory(`Найдено последнее действие категории ${category}:`, lastAction);
    return lastAction;
  },

  // Получить последнее созданное изображение
  getLastImage() {
    return this.getLastAction('image_generation');
  },

  // Проверить, было ли недавно создано изображение
  hasRecentImage(withinMinutes = 30) {
    const lastImage = this.getLastImage();
    if (!lastImage) return false;
    
    const timeDiff = Date.now() - lastImage.timestamp;
    const minutesDiff = timeDiff / (1000 * 60);
    
    return minutesDiff <= withinMinutes;
  },

  // Получить контекст для анализа
  getActionContext() {
    const recentActions = this.lastActions.slice(0, 3);
    return {
      hasRecentImage: this.hasRecentImage(),
      lastImageTime: this.getLastImage()?.timestamp,
      recentCategories: recentActions.map(a => a.category),
      totalActions: this.lastActions.length
    };
  }
};

/**
 * Грамматический анализ текста для понимания намерений
 */
function analyzeGrammar(text) {
  SmartLogger.grammar(`Анализируем грамматику: "${text.substring(0, 50)}..."`);
  
  const query = text.toLowerCase().trim();
  
  // Анализ структуры предложения
  const analysis = {
    isQuestion: false,
    isCommand: false,
    tense: 'present',
    questionWords: [],
    commandWords: [],
    timeIndicators: [],
    confidence: 0
  };

  // Вопросительные слова и фразы
  const questionPatterns = [
    'что', 'как', 'где', 'когда', 'почему', 'зачем', 'кто', 'какой', 'какая', 'какое', 'какие',
    'что такое', 'как это', 'что это', 'что ты', 'как ты', 'можешь ли', 'умеешь ли'
  ];

  // Командные слова
  const commandPatterns = [
    'создай', 'сделай', 'нарисуй', 'сгенерируй', 'построй', 'покажи', 'найди', 'поищи',
    'преобразуй', 'конвертируй', 'переведи', 'измени', 'добавь', 'удали'
  ];

  // Индикаторы времени
  const pastTimePatterns = [
    'создал', 'сделал', 'нарисовал', 'сгенерировал', 'построил', 'показал', 'нашел', 
    'искал', 'преобразовал', 'конвертировал', 'перевел', 'изменил', 'добавил', 'удалил',
    'было', 'была', 'были', 'раньше', 'ранее', 'до этого', 'уже', 'недавно'
  ];

  const futureTimePatterns = [
    'будешь', 'будет', 'собираешься', 'планируешь', 'хочешь', 'можешь', 'сможешь',
    'завтра', 'потом', 'позже', 'скоро', 'в будущем'
  ];

  // Проверка на вопросительные паттерны
  questionPatterns.forEach(pattern => {
    if (query.includes(pattern)) {
      analysis.questionWords.push(pattern);
      analysis.isQuestion = true;
    }
  });

  // Проверка на командные паттерны
  commandPatterns.forEach(pattern => {
    if (query.includes(pattern)) {
      analysis.commandWords.push(pattern);
      analysis.isCommand = true;
    }
  });

  // Определение времени
  pastTimePatterns.forEach(pattern => {
    if (query.includes(pattern)) {
      analysis.timeIndicators.push({pattern, type: 'past'});
      analysis.tense = 'past';
    }
  });

  futureTimePatterns.forEach(pattern => {
    if (query.includes(pattern)) {
      analysis.timeIndicators.push({pattern, type: 'future'});
      if (analysis.tense !== 'past') {
        analysis.tense = 'future';
      }
    }
  });

  // Специальные случаи
  if (query.includes('?')) {
    analysis.isQuestion = true;
  }

  // Если есть и вопросительные и командные слова, приоритет у вопросов
  if (analysis.isQuestion && analysis.isCommand) {
    analysis.isCommand = false;
    SmartLogger.grammar('Обнаружен конфликт: есть и вопросы и команды. Приоритет у вопроса.');
  }

  // Вычисляем уверенность в анализе
  analysis.confidence = Math.min(
    (analysis.questionWords.length + analysis.commandWords.length + analysis.timeIndicators.length) * 25,
    100
  );

  SmartLogger.grammar('Результат грамматического анализа:', analysis);
  return analysis;
}

/**
 * Умные пороги уверенности на основе контекста
 */
function calculateSmartThreshold(grammar, context, category) {
  let baseThreshold = 15; // Базовый порог
  
  // Адаптация на основе грамматики
  if (grammar.isQuestion && grammar.tense === 'past') {
    // "что ты создал?" - явно вопрос о прошлом, очень низкий порог для действий
    baseThreshold = 5;
    SmartLogger.grammar('Снижен порог: вопрос о прошлом действии');
  } else if (grammar.isCommand && grammar.tense === 'future') {
    // "создай завтра" - четкая команда, повышаем порог
    baseThreshold = 25;
    SmartLogger.grammar('Повышен порог: команда на будущее');
  } else if (grammar.isQuestion) {
    // Обычный вопрос - средний порог
    baseThreshold = 10;
    SmartLogger.grammar('Установлен низкий порог: обычный вопрос');
  } else if (grammar.isCommand) {
    // Обычная команда - стандартный порог
    baseThreshold = 20;
    SmartLogger.grammar('Установлен стандартный порог: команда');
  }

  // Адаптация на основе контекста
  if (category === 'image_generation') {
    if (context.hasRecentImage && grammar.isQuestion) {
      // Есть недавнее изображение и это вопрос - скорее всего вопрос об изображении
      baseThreshold = 3;
      SmartLogger.grammar('Критически снижен порог: вопрос при наличии недавнего изображения');
    } else if (!context.hasRecentImage && grammar.isCommand) {
      // Нет недавнего изображения и это команда - вероятно генерация
      baseThreshold = 25;
      SmartLogger.grammar('Повышен порог: команда генерации без недавних изображений');
    }
  }

  SmartLogger.grammar(`Умный порог для ${category}: ${baseThreshold}%`);
  return baseThreshold;
}

// Сервисы будут импортированы динамически при необходимости

/**
 * Основная функция анализа намерений пользователя
 * Определяет что хочет пользователь и как лучше ответить
 */
async function analyzeUserIntent(userQuery, options = {}) {
  SmartLogger.brain(`Анализирую намерения пользователя: "${userQuery.substring(0, 100)}..."`);
  
  const query = userQuery.toLowerCase().trim();
  
  // Получаем грамматический анализ, контекст действий и эмоциональный анализ
  const grammar = analyzeGrammar(userQuery);
  const context = actionMemory.getActionContext();
  const emotional = emotionalAnalyzer.analyzeEmotion(userQuery);
  
  SmartLogger.brain('Грамматический и эмоциональный контекст:', { grammar, context, emotional });
  
  // Категории запросов с приоритетами
  const intentCategories = {
    // Высокий приоритет - специфические задачи
    vectorization: {
      priority: 95,
      keywords: ['векторизация', 'svg', 'свг', 'вектор', 'превратить в svg', 'конвертировать в svg', 'trace', 'трейс'],
      confidence: 0,
      negativePatterns: [] // Паттерны исключения
    },
    
    image_generation: {
      priority: 90,
      keywords: ['нарисуй', 'создай изображение', 'сгенерируй', 'картинку', 'изображение', 'рисунок', 'фото', 'picture', 'image'],
      confidence: 0,
      negativePatterns: [
        // Исключения для вопросов о прошлом - УСИЛЕННЫЕ
        'что ты создал', 'что создал', 'что ты нарисовал', 'что нарисовал',
        'какое изображение', 'какую картинку', 'какой рисунок',
        'опиши изображение', 'опиши картинку', 'опиши рисунок', 'опиши последнее',
        'что на изображении', 'что на картинке', 'что на рисунке',
        'последнее изображение', 'предыдущее изображение', 'созданное изображение',
        'покажи что', 'расскажи что', 'объясни что'
      ]
    },
    
    embroidery: {
      priority: 85,
      keywords: ['вышивка', 'вышить', 'dst', 'pes', 'jef', 'exp', 'вышивальная машина', 'embroidery'],
      confidence: 0,
      negativePatterns: []
    },
    
    // Средний приоритет - информационные запросы
    web_search: {
      priority: 70,
      keywords: ['что такое', 'найди', 'поищи', 'когда', 'где', 'кто', 'как', 'почему', 'погода', 'новости', 'курс', 'цена'],
      confidence: 0,
      negativePatterns: []
    },
    
    time_date: {
      priority: 80,
      keywords: ['время', 'час', 'дата', 'число', 'сегодня', 'вчера', 'завтра'],
      confidence: 0,
      negativePatterns: []
    },
    
    // Низкий приоритет - обычное общение
    conversation: {
      priority: 20,
      keywords: ['привет', 'как дела', 'спасибо', 'пока', 'хорошо', 'плохо', 'да', 'нет'],
      confidence: 0,
      negativePatterns: []
    }
  };
  
  // СПЕЦИАЛЬНАЯ ПРОВЕРКА: детектор вопросов о прошлом
  const questionAboutPastPatterns = [
    'что ты создал', 'что создал', 'что ты нарисовал', 'что нарисовал',
    'что ты сделал', 'что сделал', 'опиши последнее', 'опиши что',
    'расскажи что ты', 'покажи что ты'
  ];
  
  const isQuestionAboutPast = questionAboutPastPatterns.some(pattern => query.includes(pattern));
  
  if (isQuestionAboutPast) {
    SmartLogger.brain('ОБНАРУЖЕН ВОПРОС О ПРОШЛОМ! Принудительно переводим в conversation');
    return {
      category: 'conversation',
      confidence: 95,
      query: userQuery,
      originalQuery: userQuery,
      grammar: grammar,
      context: context,
      smartThreshold: 10,
      forcedCategory: 'question_about_past'
    };
  }

  // Вычисляем уверенность для каждой категории
  for (const [category, data] of Object.entries(intentCategories)) {
    let matches = 0;
    let negativeMatches = 0;
    let totalKeywords = data.keywords.length;
    
    // Проверяем положительные совпадения
    for (const keyword of data.keywords) {
      if (query.includes(keyword)) {
        matches++;
      }
    }
    
    // Проверяем негативные паттерны (исключения)
    for (const negativePattern of data.negativePatterns) {
      if (query.includes(negativePattern)) {
        negativeMatches++;
        SmartLogger.brain(`Найден негативный паттерн для ${category}: "${negativePattern}"`);
      }
    }
    
    // Базовая уверенность от совпадений
    data.confidence = matches > 0 ? (matches / totalKeywords) * 100 : 0;
    
    // Применяем штрафы за негативные паттерны
    if (negativeMatches > 0) {
      const penalty = negativeMatches * 80; // КРИТИЧЕСКИЙ штраф за исключения
      data.confidence = Math.max(0, data.confidence - penalty);
      SmartLogger.brain(`Применен КРИТИЧЕСКИЙ штраф ${penalty}% за негативные паттерны в категории ${category}`);
    }
    
    // Грамматические модификаторы
    if (matches > 0) {
      // Специальные правила для генерации изображений
      if (category === 'image_generation') {
        if (grammar.isQuestion && grammar.tense === 'past') {
          // "что ты создал?" - вопрос о прошлом, не генерация
          data.confidence = Math.max(0, data.confidence - 70);
          SmartLogger.brain('Штраф за вопрос о прошлом в image_generation: -70%');
        } else if (grammar.isQuestion && context.hasRecentImage) {
          // Вопрос при наличии недавнего изображения - скорее всего о нем
          data.confidence = Math.max(0, data.confidence - 50);
          SmartLogger.brain('Штраф за вопрос при наличии недавнего изображения: -50%');
        } else if (grammar.isCommand && !grammar.isQuestion) {
          // Четкая команда без вопроса - бонус
          data.confidence += 30;
          SmartLogger.brain('Бонус за четкую команду в image_generation: +30%');
        }
      }
      
      // Общие грамматические бонусы
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
    
    // Ограничиваем максимальную уверенность
    data.confidence = Math.min(100, Math.max(0, data.confidence));
  }
  
  // Находим категорию с наивысшим приоритетом и уверенностью
  let bestCategory = 'conversation';
  let bestScore = 0;
  let bestConfidence = 0;
  
  for (const [category, data] of Object.entries(intentCategories)) {
    const score = data.priority * (1 + data.confidence / 100);
    if (score > bestScore && data.confidence > 0) {
      bestScore = score;
      bestCategory = category;
      bestConfidence = data.confidence;
    }
  }
  
  // Вычисляем умный порог для найденной категории
  const smartThreshold = calculateSmartThreshold(grammar, context, bestCategory);
  
  SmartLogger.brain(`Лучшая категория: ${bestCategory} (уверенность: ${bestConfidence}%, порог: ${smartThreshold}%)`);
  
  // Если уверенность ниже умного порога, используем AI анализ
  if (bestScore === 0 || bestConfidence < smartThreshold) {
    SmartLogger.brain(`Уверенность ${bestConfidence}% ниже порога ${smartThreshold}%, используем AI анализ`);
    bestCategory = await analyzeWithAI(userQuery);
    bestConfidence = 50; // Среднее значение для AI анализа
  }
  
  SmartLogger.brain(`Финальная категория: ${bestCategory} (уверенность: ${bestConfidence}%)`);
  
  return {
    category: bestCategory,
    confidence: bestConfidence,
    query: userQuery,
    originalQuery: userQuery,
    grammar: grammar,
    context: context,
    emotional: emotional,
    smartThreshold: smartThreshold
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
  
  // Определяем должен ли план выполняться на основе умного порога
  const shouldExecute = intent.confidence >= (intent.smartThreshold || 15);
  
  SmartLogger.plan(`План создан: ${plan.description}`, { 
    steps: plan.steps, 
    shouldExecute,
    confidence: intent.confidence,
    threshold: intent.smartThreshold 
  });
  
  return {
    category: intent.category,
    steps: plan.steps,
    description: plan.description,
    shouldExecute: shouldExecute,
    confidence: intent.confidence,
    grammar: intent.grammar,
    context: intent.context,
    emotional: intent.emotional
  };
}

/**
 * Выполнение плана действий
 */
async function executePlan(plan, userQuery, options = {}) {
  SmartLogger.execute(`Выполняю план: ${plan.description}`);
  
  try {
    let result = { success: false, shouldFallback: true };
    
    // Передаем эмоциональный контекст во все планы
    const enhancedOptions = {
      ...options,
      emotional: plan.emotional
    };
    
    switch (plan.category) {
      case 'web_search':
        result = await executeWebSearchPlan(userQuery, enhancedOptions);
        break;
        
      case 'image_generation':
        result = await executeImageGenerationPlan(userQuery, enhancedOptions);
        break;
        
      case 'vectorization':
        result = await executeVectorizationPlan(userQuery, enhancedOptions);
        break;
        
      case 'embroidery':
        result = await executeEmbroideryPlan(userQuery, enhancedOptions);
        break;
        
      case 'time_date':
        result = await executeTimeDatePlan(userQuery, enhancedOptions);
        break;
        
      case 'conversation':
        result = await executeConversationPlan(userQuery, enhancedOptions);
        break;
        
      default:
        result = { success: false, shouldFallback: true };
    }
    
    // Сохраняем успешные действия в память
    if (result.success) {
      const actionToSave = {
        category: plan.category,
        query: userQuery,
        response: result.response?.substring(0, 200) + '...' || 'Success',
        imageUrl: result.imageUrl || null,
        confidence: plan.confidence,
        grammar: plan.grammar
      };
      
      actionMemory.saveAction(actionToSave);
    }
    
    return result;
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
      let response = searchResult.aiProcessedAnswer;
      
      // Применяем эмоциональную адаптацию
      if (options.emotional) {
        response = emotionalAnalyzer.generateEmotionalResponse(
          options.emotional, 
          response, 
          'web_search'
        );
      }
      
      return {
        success: true,
        response: response,
        provider: 'IntelligentWebSearchEmotional',
        category: 'web_search',
        searchUsed: true,
        sources: searchResult.sources?.slice(0, 3) || [],
        emotionalTone: options.emotional?.overallTone || 'neutral'
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
      let baseResponse = `Изображение создано! 

![Сгенерированное изображение](${imageResult.imageUrl})

🎨 **Стиль:** Реалистичный
📐 **Размер:** 1024x1024
🖼️ **Качество:** Высокое

Если нужно что-то изменить, просто опишите что хотите поправить.`;

      // Применяем эмоциональную адаптацию если есть эмоциональный контекст
      if (options.emotional) {
        baseResponse = emotionalAnalyzer.generateEmotionalResponse(
          options.emotional, 
          baseResponse, 
          'image_generation'
        );
      }

      return {
        success: true,
        response: baseResponse,
        provider: 'IntelligentImageGeneratorEmotional',
        category: 'image_generation',
        imageGenerated: true,
        imageUrl: imageResult.imageUrl,
        emotionalTone: options.emotional?.overallTone || 'neutral'
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
  
  let response = `Сейчас: ${timeStr} (московское время)`;
  
  // Применяем эмоциональную адаптацию
  if (options.emotional) {
    response = emotionalAnalyzer.generateEmotionalResponse(
      options.emotional, 
      response, 
      'time_date'
    );
  }
  
  return {
    success: true,
    response: response,
    provider: 'IntelligentTimeProviderEmotional',
    category: 'time_date',
    emotionalTone: options.emotional?.overallTone || 'neutral'
  };
}

/**
 * Выполнение плана обычного общения
 */
async function executeConversationPlan(userQuery, options) {
  SmartLogger.execute(`Генерирую ответ для обычного общения`);
  
  try {
    // Получаем эмоциональное состояние из опций
    const emotional = options.emotional || { dominantEmotion: 'neutral', overallTone: 'neutral' };
    
    // Адаптируем промпт под эмоциональное состояние
    let conversationPrompt = `Ты дружелюбный AI-помощник. `;
    
    // Настраиваем стиль ответа под эмоцию пользователя
    switch (emotional.dominantEmotion) {
      case 'joy':
        conversationPrompt += `Пользователь в хорошем настроении! Отвечай позитивно и энергично. `;
        break;
      case 'anger':
        conversationPrompt += `Пользователь расстроен или раздражён. Отвечай спокойно, понимающе и конструктивно. `;
        break;
      case 'sadness':
        conversationPrompt += `Пользователь грустит или устал. Отвечай поддерживающе и ободряюще. `;
        break;
      case 'surprise':
        conversationPrompt += `Пользователь удивлён или любопытен. Отвечай интересно и познавательно. `;
        break;
      case 'polite':
        conversationPrompt += `Пользователь очень вежлив. Отвечай также вежливо и учтиво. `;
        break;
      default:
        conversationPrompt += `Отвечай естественно и дружелюбно. `;
    }
    
    conversationPrompt += `

Пользователь: "${userQuery}"

Ответь в соответствии с настроением пользователя. Если можешь помочь чем-то конкретным, предложи это.`;

    const g4fProvider = require('./g4f-provider.js');
    const result = await g4fProvider.generateResponse(conversationPrompt, {
      provider: 'Qwen_Qwen_2_72B',
      max_tokens: 200
    });
    
    if (result.success && result.response) {
      // Применяем эмоциональную адаптацию к ответу
      const adaptedResponse = emotionalAnalyzer.generateEmotionalResponse(
        emotional, 
        result.response.trim(), 
        'conversation'
      );
      
      return {
        success: true,
        response: adaptedResponse,
        provider: 'IntelligentConversationEmotional',
        category: 'conversation',
        emotionalTone: emotional.overallTone
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
    
    // Шаг 3: Выполнение плана (используем умные пороги)
    if (plan.shouldExecute) {
      SmartLogger.brain(`Выполняем план с уверенностью ${plan.confidence}% (порог пройден)`);
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
    SmartLogger.brain(`=== ПЛАН НЕ ПРОШЕЛ УМНЫЙ ПОРОГ, ПЕРЕХОД К СТАНДАРТНОЙ ЛОГИКЕ ===`);
    SmartLogger.brain(`Уверенность: ${plan.confidence}%, требуемый порог: ${intent.smartThreshold}%`);
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