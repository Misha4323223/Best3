/**
 * Интеллектуальный процессор чата - "невидимый мозг" приложения
 * Автоматически анализирует намерения пользователя и планирует оптимальный ответ
 * Работает прозрачно, как система принятия решений в ChatGPT-4
 */

/**
 * Универсальная функция для добавления таймаутов к асинхронным операциям
 */
function withTimeout(promise, timeoutMs, description = 'Operation') {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Timeout: ${description} превысил лимит ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

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
 * Система контекстного анализа намерений создания
 * Определяет ЧТО именно пользователь хочет создать
 */
function analyzeCreationContext(query) {
  SmartLogger.brain(`Анализирую контекст создания для: "${query.substring(0, 50)}..."`);
  
  const lowerQuery = query.toLowerCase().trim();
  
  // Объекты для визуального создания
  const visualObjects = [
    'изображение', 'картинку', 'рисунок', 'фото', 'арт', 'картину', 'дизайн',
    'логотип', 'иконку', 'баннер', 'постер', 'обложку', 'иллюстрацию',
    'графику', 'схему визуальную', 'диаграмму', 'чертеж'
  ];
  
  // Команды визуального создания (более точная проверка)
  const visualCommands = [
    'нарисуй', 'рисуй', 'изобрази', 'покажи как выглядит', 'визуализируй'
  ];
  
  // Объекты для текстового создания
  const textObjects = [
    'список', 'план', 'таблицу', 'документ', 'файл', 'текст', 'статью',
    'отчет', 'резюме', 'письмо', 'код', 'скрипт', 'программу', 'базу данных',
    'структуру', 'алгоритм', 'расписание', 'календарь', 'заметку'
  ];
  
  // Объекты для других типов создания
  const otherObjects = [
    'канал', 'группу', 'аккаунт', 'профиль', 'папку', 'директорию',
    'ссылку', 'подключение', 'сервер', 'сайт', 'приложение'
  ];
  
  let result = {
    type: 'unknown',
    confidence: 0,
    detectedObject: null,
    isCreationIntent: false
  };
  
  // Проверяем наличие команд создания
  const creationCommands = ['создай', 'сделай', 'построй', 'сгенерируй', 'напиши', 'нарисуй'];
  const hasCreationCommand = creationCommands.some(cmd => lowerQuery.includes(cmd));
  
  if (!hasCreationCommand) {
    SmartLogger.brain('Команды создания не обнаружены');
    return result;
  }
  
  result.isCreationIntent = true;
  
  // Ищем визуальные объекты
  for (const obj of visualObjects) {
    if (lowerQuery.includes(obj)) {
      result.type = 'visual';
      result.confidence = Math.min(90, result.confidence + 30);
      result.detectedObject = obj;
      SmartLogger.brain(`Обнаружен визуальный объект: "${obj}"`);
      break; // Берем первое совпадение
    }
  }
  
  // Ищем команды визуального создания (если объект не найден)
  if (result.type === 'unknown') {
    for (const cmd of visualCommands) {
      if (lowerQuery.includes(cmd)) {
        result.type = 'visual';
        result.confidence = Math.min(80, result.confidence + 25);
        result.detectedObject = `команда: ${cmd}`;
        SmartLogger.brain(`Обнаружена команда визуального создания: "${cmd}"`);
        break;
      }
    }
  }
  
  // Ищем текстовые объекты (только если не найден визуальный)
  if (result.type === 'unknown') {
    for (const obj of textObjects) {
      if (lowerQuery.includes(obj)) {
        result.type = 'textual';
        result.confidence = Math.min(85, result.confidence + 25);
        result.detectedObject = obj;
        SmartLogger.brain(`Обнаружен текстовый объект: "${obj}"`);
        break;
      }
    }
  }
  
  // Ищем другие объекты
  if (result.type === 'unknown') {
    for (const obj of otherObjects) {
      if (lowerQuery.includes(obj)) {
        result.type = 'other';
        result.confidence = Math.min(70, result.confidence + 20);
        result.detectedObject = obj;
        SmartLogger.brain(`Обнаружен другой объект: "${obj}"`);
        break;
      }
    }
  }
  
  // Специальная логика для одиночного "создай"
  if (lowerQuery.trim() === 'создай' || lowerQuery.trim() === 'сделай') {
    result.type = 'ambiguous';
    result.confidence = 5; // Очень низкая уверенность
    SmartLogger.brain('Обнаружена неопределенная команда создания без объекта');
  }
  
  SmartLogger.brain(`Результат анализа контекста создания:`, result);
  return result;
}

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

// Система расширенной памяти сессии
const sessionMemory = {
  sessions: new Map(),
  maxSessionAge: 24 * 60 * 60 * 1000, // 24 часа

  // Получить или создать данные сессии
  getSession(sessionId = 'default') {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, {
        sessionId,
        userName: null,
        goals: [],
        topics: [],
        preferences: {},
        createdAt: Date.now(),
        lastActivity: Date.now(),
        statistics: {
          messagesCount: 0,
          goalsAchieved: 0,
          topicsDiscussed: 0
        }
      });
      SmartLogger.memory(`Создана новая сессия: ${sessionId}`);
    }
    
    const session = this.sessions.get(sessionId);
    session.lastActivity = Date.now();
    return session;
  },

  // Установить имя пользователя
  setUserName(sessionId, name) {
    const session = this.getSession(sessionId);
    const oldName = session.userName;
    session.userName = name;
    
    SmartLogger.memory(`Имя пользователя изменено: "${oldName}" → "${name}" (сессия: ${sessionId})`);
    return `Отлично! Теперь я буду называть вас ${name}. Приятно познакомиться! 😊`;
  },

  // Добавить цель
  addGoal(sessionId, goal, priority = 'medium') {
    const session = this.getSession(sessionId);
    const goalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      text: goal,
      priority,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    session.goals.push(goalRecord);
    session.statistics.goalsAchieved = session.goals.filter(g => g.status === 'completed').length;
    
    SmartLogger.memory(`Добавлена цель: "${goal}" (приоритет: ${priority}, сессия: ${sessionId})`);
    
    const userName = session.userName ? `, ${session.userName}` : '';
    return `Понял${userName}! Добавил в ваши цели: "${goal}". Общее количество активных целей: ${session.goals.filter(g => g.status === 'active').length}. Чем могу помочь в её достижении? 🎯`;
  },

  // Запомнить тему
  rememberTopic(sessionId, topic, category = 'general') {
    const session = this.getSession(sessionId);
    const topicRecord = {
      id: Math.random().toString(36).substr(2, 9),
      text: topic,
      category,
      mentions: 1,
      createdAt: Date.now(),
      lastMentioned: Date.now()
    };
    
    // Проверяем, есть ли уже похожая тема
    const existingTopic = session.topics.find(t => 
      t.text.toLowerCase().includes(topic.toLowerCase()) || 
      topic.toLowerCase().includes(t.text.toLowerCase())
    );
    
    if (existingTopic) {
      existingTopic.mentions++;
      existingTopic.lastMentioned = Date.now();
      SmartLogger.memory(`Обновлена тема: "${topic}" (упоминаний: ${existingTopic.mentions})`);
    } else {
      session.topics.push(topicRecord);
      session.statistics.topicsDiscussed = session.topics.length;
      SmartLogger.memory(`Добавлена новая тема: "${topic}" (категория: ${category})`);
    }
    
    return `Запомнил тему "${topic}". Теперь я буду учитывать её в наших разговорах! 📝`;
  },

  // Автоматическое извлечение целей из текста
  extractGoalsFromText(sessionId, text) {
    const goalPatterns = [
      /я хочу\s+(.+?)(?:[.!?]|$)/gi,
      /мне нужно\s+(.+?)(?:[.!?]|$)/gi,
      /хотел бы\s+(.+?)(?:[.!?]|$)/gi,
      /планирую\s+(.+?)(?:[.!?]|$)/gi,
      /собираюсь\s+(.+?)(?:[.!?]|$)/gi,
      /моя цель\s+(.+?)(?:[.!?]|$)/gi,
      /стремлюсь\s+(.+?)(?:[.!?]|$)/gi
    ];

    const extractedGoals = [];
    
    goalPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const goal = match[1].trim();
        if (goal.length > 3 && goal.length < 200) {
          extractedGoals.push(goal);
        }
      }
    });

    if (extractedGoals.length > 0) {
      const responses = [];
      extractedGoals.forEach(goal => {
        const response = this.addGoal(sessionId, goal, 'auto-detected');
        responses.push(response);
      });
      
      SmartLogger.memory(`Автоматически извлечено целей: ${extractedGoals.length} из текста: "${text.substring(0, 100)}..."`);
      return responses;
    }

    return null;
  },

  // Получить контекст пользователя для AI
  getUserContext(sessionId) {
    const session = this.getSession(sessionId);
    
    let context = 'КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:\n';
    
    if (session.userName) {
      context += `👤 Имя: ${session.userName}\n`;
    }
    
    if (session.goals.length > 0) {
      const activeGoals = session.goals.filter(g => g.status === 'active');
      if (activeGoals.length > 0) {
        context += `🎯 Активные цели (${activeGoals.length}):\n`;
        activeGoals.slice(0, 5).forEach((goal, index) => {
          context += `   ${index + 1}. ${goal.text} (${goal.priority})\n`;
        });
      }
    }
    
    if (session.topics.length > 0) {
      const recentTopics = session.topics
        .sort((a, b) => b.lastMentioned - a.lastMentioned)
        .slice(0, 3);
      
      context += `📝 Последние темы:\n`;
      recentTopics.forEach((topic, index) => {
        context += `   ${index + 1}. ${topic.text} (${topic.mentions} раз)\n`;
      });
    }
    
    context += `📊 Статистика: ${session.statistics.messagesCount} сообщений, ${session.statistics.topicsDiscussed} тем\n`;
    
    return context;
  },

  // Команды управления памятью
  processMemoryCommand(sessionId, command, params) {
    SmartLogger.memory(`Обработка команды памяти: ${command} с параметрами:`, params);
    
    switch (command.toLowerCase()) {
      case 'setusername':
      case 'set_user_name':
        if (params && params.length > 0) {
          return this.setUserName(sessionId, params.join(' '));
        }
        return 'Пожалуйста, укажите имя. Пример: "setUserName Анна"';
        
      case 'addgoal':
      case 'add_goal':
        if (params && params.length > 0) {
          const priority = params.includes('--high') ? 'high' : 
                          params.includes('--low') ? 'low' : 'medium';
          const goalText = params.filter(p => !p.startsWith('--')).join(' ');
          return this.addGoal(sessionId, goalText, priority);
        }
        return 'Пожалуйста, укажите цель. Пример: "addGoal изучить программирование --high"';
        
      case 'remembertopic':
      case 'remember_topic':
        if (params && params.length > 0) {
          return this.rememberTopic(sessionId, params.join(' '));
        }
        return 'Пожалуйста, укажите тему. Пример: "rememberTopic искусственный интеллект"';
        
      case 'showmemory':
      case 'show_memory':
        return this.getUserContext(sessionId);
        
      case 'clearmemory':
      case 'clear_memory':
        return this.clearSession(sessionId);
        
      default:
        return `Неизвестная команда памяти: ${command}. Доступные команды: setUserName, addGoal, rememberTopic, showMemory, clearMemory`;
    }
  },

  // Очистка сессии
  clearSession(sessionId) {
    if (this.sessions.has(sessionId)) {
      const session = this.sessions.get(sessionId);
      const backup = { ...session };
      
      session.goals = [];
      session.topics = [];
      session.preferences = {};
      session.statistics = {
        messagesCount: 0,
        goalsAchieved: 0,
        topicsDiscussed: 0
      };
      
      SmartLogger.memory(`Очищена память сессии: ${sessionId}`, backup);
      return 'Память сессии очищена! Вы можете начать заново. 🔄';
    }
    
    return 'Сессия не найдена.';
  },

  // Автоматическая очистка старых сессий
  cleanupOldSessions() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.maxSessionAge) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      SmartLogger.memory(`Очищено старых сессий: ${cleaned}`);
    }
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

// Автоматическая очистка старых сессий каждые 30 минут
setInterval(() => {
  sessionMemory.cleanupOldSessions();
}, 30 * 60 * 1000);

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
  const sessionId = options.sessionId || 'default';
  
  // Получаем грамматический анализ, контекст действий и эмоциональный анализ
  const grammar = analyzeGrammar(userQuery);
  const context = actionMemory.getActionContext();
  const emotional = emotionalAnalyzer.analyzeEmotion(userQuery);
  
  // Получаем пользовательский контекст из памяти сессии
  const userContext = sessionMemory.getUserContext(sessionId);
  const session = sessionMemory.getSession(sessionId);
  
  // Увеличиваем счетчик сообщений
  session.statistics.messagesCount++;
  
  // Автоматическое извлечение целей из текста пользователя
  const extractedGoals = sessionMemory.extractGoalsFromText(sessionId, userQuery);
  
  // Проверяем, является ли это командой управления памятью
  const memoryCommandMatch = query.match(/^(setusername|set_user_name|addgoal|add_goal|remembertopic|remember_topic|showmemory|show_memory|clearmemory|clear_memory)\s*(.*)/i);
  
  if (memoryCommandMatch) {
    const [, command, paramString] = memoryCommandMatch;
    const params = paramString ? paramString.split(' ').filter(p => p.length > 0) : [];
    
    SmartLogger.brain(`Обнаружена команда памяти: ${command}`);
    
    return {
      category: 'memory_command',
      confidence: 100,
      query: userQuery,
      originalQuery: userQuery,
      command: command,
      params: params,
      grammar: grammar,
      context: context,
      emotional: emotional,
      userContext: userContext,
      smartThreshold: 5
    };
  }
  
  // === КОНТЕКСТНЫЙ АНАЛИЗ СОЗДАНИЯ ===
  const creationContext = analyzeCreationContext(userQuery);
  
  SmartLogger.brain('Контекст анализа:', { 
    grammar, 
    context, 
    emotional, 
    creationContext,
    userContext: userContext.substring(0, 200) + '...',
    extractedGoals: extractedGoals ? extractedGoals.length : 0
  });
  
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
      keywords: [
        'нарисуй', 'создай изображение', 'создай картинку', 'создай рисунок', 'создай фото',
        'сгенерируй изображение', 'сгенерируй картинку', 'сгенерируй', 'рисунок', 'фото', 'picture', 'image'
      ],
      confidence: 0,
      negativePatterns: [
        // Исключения для вопросов о прошлом - УСИЛЕННЫЕ
        'что ты создал', 'что создал', 'что ты нарисовал', 'что нарисовал',
        'какое изображение', 'какую картинку', 'какой рисунок',
        'опиши изображение', 'опиши картинку', 'опиши рисунок', 'опиши последнее',
        'что на изображении', 'что на картинке', 'что на рисунке',
        'последнее изображение', 'предыдущее изображение', 'созданное изображение',
        'покажи что', 'расскажи что', 'объясни что',
        // Дополнительные исключения для текстовых объектов
        'создай список', 'создай план', 'создай таблицу', 'создай документ', 'создай файл',
        'создай текст', 'создай статью', 'создай отчет', 'создай резюме', 'создай письмо',
        'создай код', 'создай скрипт', 'создай программу', 'создай алгоритм',
        'создай структуру', 'создай базу данных', 'создай расписание', 'создай календарь',
        // Исключения для вопросов об изображениях
        'что за изображение', 'это изображение', 'про изображение', 'об изображении',
        'изображение выше', 'данное изображение', 'такое изображение', 'изображение которое',
        'получилось изображение', 'вижу изображение', 'на изображении показано'
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
    
    // === КОНТЕКСТНЫЕ МОДИФИКАТОРЫ НА ОСНОВЕ АНАЛИЗА СОЗДАНИЯ ===
    if (category === 'image_generation' && creationContext.isCreationIntent) {
      if (creationContext.type === 'visual') {
        // БОНУС: Четко определен визуальный объект
        data.confidence += 40;
        SmartLogger.brain(`КОНТЕКСТНЫЙ БОНУС: визуальный объект "${creationContext.detectedObject}" (+40%)`);
      } else if (creationContext.type === 'textual') {
        // КРИТИЧЕСКИЙ ШТРАФ: Определен текстовый объект
        data.confidence = Math.max(0, data.confidence - 90);
        SmartLogger.brain(`КОНТЕКСТНЫЙ ШТРАФ: текстовый объект "${creationContext.detectedObject}" (-90%)`);
      } else if (creationContext.type === 'other') {
        // БОЛЬШОЙ ШТРАФ: Определен другой тип объекта
        data.confidence = Math.max(0, data.confidence - 70);
        SmartLogger.brain(`КОНТЕКСТНЫЙ ШТРАФ: другой объект "${creationContext.detectedObject}" (-70%)`);
      } else if (creationContext.type === 'ambiguous') {
        // ШТРАФ: Неопределенная команда создания
        data.confidence = Math.max(0, data.confidence - 60);
        SmartLogger.brain('КОНТЕКСТНЫЙ ШТРАФ: неопределенная команда создания (-60%)');
      }
    }

    // Грамматические модификаторы
    if (matches > 0) {
      // Специальные правила для генерации изображений
      if (category === 'image_generation') {
        if (grammar.isQuestion && grammar.tense === 'past') {
          // "что ты создал?" - вопрос о прошлом, не генерация
          data.confidence = Math.max(0, data.confidence - 90); // Увеличил штраф с 70 до 90
          SmartLogger.brain('Штраф за вопрос о прошлом в image_generation: -90%');
        } else if (grammar.isQuestion && context.hasRecentImage) {
          // Вопрос при наличии недавнего изображения - скорее всего о нем
          data.confidence = Math.max(0, data.confidence - 80); // Увеличил штраф с 50 до 80
          SmartLogger.brain('Штраф за вопрос при наличии недавнего изображения: -80%');
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
    try {
      bestCategory = await withTimeout(
        analyzeWithAI(userQuery),
        10000, // 10 секунд
        'AI анализ намерений пользователя'
      );
      bestConfidence = 50; // Среднее значение для AI анализа
    } catch (error) {
      SmartLogger.brain(`AI анализ не удался: ${error.message}, используем conversation`);
      bestCategory = 'conversation';
      bestConfidence = 20;
    }
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
    const analysisPrompt = `Проанализируй этот запрос пользователя и определи его тип, учитывая КОНТЕКСТ и ЧТО именно нужно создать:

Запрос: "${userQuery}"

ВАЖНЫЕ ПРАВИЛА:
1. Если говорится "создай список/план/таблицу/код/документ" - это НЕ image_generation
2. Если говорится "создай изображение/картинку/рисунок" - это image_generation
3. Если спрашивают "что создал/нарисовал?" - это conversation (вопрос о прошлом)
4. Если спрашивают "что на изображении?" - это conversation (анализ существующего)

ПРИМЕРЫ:
- "создай список покупок" → conversation (текстовая задача)
- "создай изображение кота" → image_generation (визуальная задача)
- "что ты создал?" → conversation (вопрос о прошлом)
- "опиши изображение" → conversation (анализ существующего)

Возможные типы:
- web_search: если нужна актуальная информация из интернета
- image_generation: если нужно создать ВИЗУАЛЬНЫЙ объект (изображение, картинку, рисунок)
- vectorization: если нужно конвертировать изображение в векторный формат
- embroidery: если связано с вышивкой или файлами для вышивальных машин
- time_date: если спрашивает время или дату
- conversation: если это обычное общение, текстовые задачи или вопросы

Ответь только одним словом - типом запроса.`;

    const g4fProvider = await import('./g4f-provider.js');
    const result = await withTimeout(
      g4fProvider.generateResponse(analysisPrompt, {
        provider: 'Qwen_Qwen_2_72B',
        max_tokens: 20
      }),
      8000, // 8 секунд для быстрого анализа
      'G4F анализ категории запроса'
    );
    
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
    },
    
    memory_command: {
      steps: [
        'execute_memory_command'
      ],
      description: 'Выполнение команд управления памятью'
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
        // Векторизация выполняется через smart-router fallback
        SmartLogger.execute(`Векторизация передается в smart-router`);
        result = { success: false, shouldFallback: true };
        break;
        
      case 'embroidery':
        // Конвертация в вышивку выполняется через smart-router fallback  
        SmartLogger.execute(`Конвертация в вышивку передается в smart-router`);
        result = { success: false, shouldFallback: true };
        break;
        
      case 'time_date':
        result = await executeTimeDatePlan(userQuery, enhancedOptions);
        break;
        
      case 'conversation':
        result = await executeConversationPlan(userQuery, enhancedOptions);
        break;
        
      case 'memory_command':
        result = await executeMemoryCommandPlan(plan, userQuery, enhancedOptions);
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
  
  const reasons = [];
  reasons.push(`Определил запрос "${userQuery}" как поисковый`);
  
  try {
    const { default: webSearchProvider } = await withTimeout(
      import('./web-search-provider.js'),
      5000, // 5 секунд для импорта
      'Импорт модуля веб-поиска'
    );
    
    reasons.push('Использую продвинутый веб-поиск для получения актуальной информации');
    
    const searchResult = await withTimeout(
      webSearchProvider.performAdvancedSearch(userQuery, {
        language: 'ru',
        maxResults: 8,
        includeAIProcessing: true
      }),
      25000, // 25 секунд для веб-поиска
      'Выполнение веб-поиска'
    );
    
    if (searchResult.success && searchResult.aiProcessedAnswer) {
      let response = searchResult.aiProcessedAnswer;
      
      reasons.push('AI обработал результаты поиска и сформировал структурированный ответ');
      
      // Применяем эмоциональную адаптацию
      if (options.emotional) {
        response = emotionalAnalyzer.generateEmotionalResponse(
          options.emotional, 
          response, 
          'web_search'
        );
        reasons.push(`Адаптировал ответ под эмоциональное состояние: ${options.emotional.dominantEmotion}`);
      }
      
      const finalReason = reasons.join(' → ');
      SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
      
      return {
        success: true,
        response: response,
        provider: 'IntelligentWebSearchEmotional',
        category: 'web_search',
        searchUsed: true,
        sources: searchResult.sources?.slice(0, 3) || [],
        emotionalTone: options.emotional?.overallTone || 'neutral',
        reason: finalReason
      };
    }
    
    reasons.push('Поиск не дал релевантных результатов, перехожу к стандартной логике');
    SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${reasons.join(' → ')}`);
    return { success: false, shouldFallback: true, reason: reasons.join(' → ') };
  } catch (error) {
    reasons.push(`Ошибка поиска: ${error.message}`);
    const finalReason = reasons.join(' → ');
    SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
    return { success: false, shouldFallback: true, reason: finalReason };
  }
}

/**
 * Выполнение плана генерации изображений
 */
async function executeImageGenerationPlan(userQuery, options) {
  SmartLogger.execute(`Выполняю генерацию изображения для: "${userQuery}"`);
  
  const reasons = [];
  reasons.push(`Распознал запрос "${userQuery}" как команду создания изображения`);
  
  try {
    // Определяем стиль на основе запроса
    let style = 'realistic';
    if (userQuery.includes('принт') || userQuery.includes('футболка') || userQuery.includes('логотип')) {
      style = 'print';
      reasons.push('Определил стиль "print" на основе ключевых слов (принт/футболка/логотип)');
    } else if (userQuery.includes('мультяшн') || userQuery.includes('cartoon')) {
      style = 'cartoon';
      reasons.push('Определил стиль "cartoon" на основе ключевых слов');
    } else if (userQuery.includes('художественн') || userQuery.includes('артистич')) {
      style = 'artistic';
      reasons.push('Определил стиль "artistic" на основе ключевых слов');
    } else {
      reasons.push('Использую стиль "realistic" по умолчанию');
    }
    
    // Используем улучшенную систему промптов
    reasons.push('Применяю систему улучшения промптов: очистка → перевод → оптимизация');
    const enhancedPrompt = await promptEnhancer.enhancePrompt(userQuery, style);
    
    const { default: aiImageGenerator } = await withTimeout(
      import('./ai-image-generator.js'),
      5000, // 5 секунд для импорта
      'Импорт генератора изображений'
    );
    reasons.push('Использую AI генератор изображений Pollinations.ai');
    
    const imageResult = await withTimeout(
      aiImageGenerator.generateImage(enhancedPrompt, {
        style: style,
        quality: 'high'
      }),
      60000, // 60 секунд для генерации изображения
      'Генерация изображения'
    );
    
    if (imageResult.success && imageResult.imageUrl) {
      reasons.push('Изображение успешно сгенерировано, формирую детальный ответ с метаданными');
      
      let baseResponse = `✨ Изображение создано с улучшенным промптом! 

![Сгенерированное изображение](${imageResult.imageUrl})

🎨 **Стиль:** ${style === 'realistic' ? 'Реалистичный' : style === 'print' ? 'Для печати' : style === 'cartoon' ? 'Мультипликационный' : 'Художественный'}
📐 **Размер:** 1024x1024
🖼️ **Качество:** Высокое
🔧 **Промпт улучшен:** Да

💡 **Применены улучшения:**
• Очистка от лишних слов
• Перевод на английский
• Добавление технических деталей
• Оптимизация для качества

Если нужно что-то изменить, просто опишите что хотите поправить.`;

      // Применяем эмоциональную адаптацию если есть эмоциональный контекст
      if (options.emotional) {
        baseResponse = emotionalAnalyzer.generateEmotionalResponse(
          options.emotional, 
          baseResponse, 
          'image_generation'
        );
        reasons.push(`Адаптировал ответ под эмоцию пользователя: ${options.emotional.dominantEmotion}`);
      }

      const finalReason = reasons.join(' → ');
      SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);

      return {
        success: true,
        response: baseResponse,
        provider: 'IntelligentImageGeneratorEnhanced',
        category: 'image_generation',
        imageGenerated: true,
        imageUrl: imageResult.imageUrl,
        enhancedPrompt: enhancedPrompt,
        originalPrompt: userQuery,
        detectedStyle: style,
        emotionalTone: options.emotional?.overallTone || 'neutral',
        reason: finalReason
      };
    }
    
    reasons.push('Генерация изображения не удалась, перехожу к стандартной логике');
    const finalReason = reasons.join(' → ');
    SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
    return { success: false, shouldFallback: true, reason: finalReason };
  } catch (error) {
    reasons.push(`Ошибка генерации: ${error.message}`);
    const finalReason = reasons.join(' → ');
    SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
    return { success: false, shouldFallback: true, reason: finalReason };
  }
}

/**
 * Система улучшения промптов для генерации изображений
 */
const promptEnhancer = {
  /**
   * Очистка промпта от лишних слов и повторов
   */
  cleanPrompt(prompt) {
    SmartLogger.execute(`Очистка промпта: "${prompt.substring(0, 50)}..."`);
    
    let cleaned = prompt.toLowerCase().trim();
    
    // Удаляем команды генерации
    const generationCommands = [
      'создай изображение', 'нарисуй', 'сгенерируй', 'сделай картинку',
      'создай картинку', 'покажи', 'изобрази', 'нарисуй мне'
    ];
    
    generationCommands.forEach(command => {
      cleaned = cleaned.replace(new RegExp(`\\b${command}\\b`, 'gi'), '');
    });
    
    // Удаляем лишние слова-паразиты
    const fillerWords = [
      'пожалуйста', 'можешь', 'хочу', 'мне нужно', 'давай',
      'сделай так чтобы', 'я хочу', 'мне бы', 'было бы неплохо'
    ];
    
    fillerWords.forEach(filler => {
      cleaned = cleaned.replace(new RegExp(`\\b${filler}\\b`, 'gi'), '');
    });
    
    // Убираем множественные "и"
    cleaned = cleaned.replace(/\s+и\s+и\s+/g, ' и ');
    cleaned = cleaned.replace(/\s+и\s+и\s+/g, ' и ');
    
    // Убираем повторяющиеся слова
    const words = cleaned.split(/\s+/);
    const uniqueWords = [];
    const seenWords = new Set();
    
    for (const word of words) {
      if (word && word.length > 2 && !seenWords.has(word)) {
        uniqueWords.push(word);
        seenWords.add(word);
      } else if (word && word.length <= 2) {
        uniqueWords.push(word); // Короткие слова не фильтруем
      }
    }
    
    cleaned = uniqueWords.join(' ').trim();
    
    // Убираем лишние пробелы и знаки препинания
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/[,;.!?]+/g, ',');
    cleaned = cleaned.replace(/,+/g, ',');
    cleaned = cleaned.replace(/^,|,$/, '');
    
    SmartLogger.execute(`Промпт очищен: "${cleaned}"`);
    return cleaned;
  },

  /**
   * Простой перевод ключевых слов с русского на английский
   */
  translateToEnglish(prompt) {
    SmartLogger.execute(`Перевод промпта: "${prompt.substring(0, 50)}..."`);
    
    // Расширенный словарь перевода
    const translations = {
      // Объекты и существа
      'кот': 'cat', 'кота': 'cat', 'котик': 'cute cat', 'котенок': 'kitten',
      'собака': 'dog', 'собаку': 'dog', 'щенок': 'puppy',
      'человек': 'person', 'мужчина': 'man', 'женщина': 'woman',
      'девушка': 'young woman', 'парень': 'young man',
      'дракон': 'dragon', 'дракона': 'dragon',
      'робот': 'robot', 'робота': 'robot',
      'машина': 'car', 'автомобиль': 'automobile',
      'дом': 'house', 'здание': 'building',
      'цветок': 'flower', 'цветы': 'flowers',
      'дерево': 'tree', 'деревья': 'trees',
      'роза': 'rose', 'розы': 'roses',
      
      // Цвета
      'красный': 'red', 'красная': 'red', 'красное': 'red',
      'синий': 'blue', 'синяя': 'blue', 'синее': 'blue',
      'зеленый': 'green', 'зеленая': 'green', 'зеленое': 'green',
      'желтый': 'yellow', 'желтая': 'yellow', 'желтое': 'yellow',
      'черный': 'black', 'черная': 'black', 'черное': 'black',
      'белый': 'white', 'белая': 'white', 'белое': 'white',
      'розовый': 'pink', 'розовая': 'pink', 'розовое': 'pink',
      'фиолетовый': 'purple', 'фиолетовая': 'purple',
      
      // Стили и характеристики
      'красивый': 'beautiful', 'красивая': 'beautiful', 'красивое': 'beautiful',
      'большой': 'large', 'большая': 'large', 'большое': 'large',
      'маленький': 'small', 'маленькая': 'small', 'маленькое': 'small',
      'яркий': 'bright', 'яркая': 'bright', 'яркое': 'bright',
      'темный': 'dark', 'темная': 'dark', 'темное': 'dark',
      'реалистичный': 'realistic', 'реалистичная': 'realistic',
      'мультяшный': 'cartoon style', 'мультипликационный': 'animated style',
      
      // Места и окружение
      'лес': 'forest', 'в лесу': 'in forest',
      'море': 'ocean', 'у моря': 'by the ocean',
      'горы': 'mountains', 'в горах': 'in mountains',
      'город': 'city', 'в городе': 'in city',
      'космос': 'space', 'в космосе': 'in space',
      'небо': 'sky', 'облака': 'clouds',
      
      // Техника и предметы
      'принт': 'print design', 'дизайн': 'design',
      'футболка': 't-shirt', 'одежда': 'clothing',
      'логотип': 'logo', 'эмблема': 'emblem',
      'сапоги': 'boots', 'в сапогах': 'wearing boots',
      
      // Действия и состояния
      'стоит': 'standing', 'сидит': 'sitting',
      'летит': 'flying', 'бежит': 'running',
      'улыбается': 'smiling', 'грустный': 'sad',
      
      // Качество и детали
      'детально': 'detailed', 'детальный': 'highly detailed',
      'качественно': 'high quality', 'профессионально': 'professional',
      'четко': 'sharp', 'четкий': 'sharp and clear'
    };
    
    let translated = prompt;
    
    // Переводим по словарю (сначала длинные фразы, потом короткие)
    const sortedTranslations = Object.entries(translations)
      .sort(([a], [b]) => b.length - a.length);
    
    for (const [russian, english] of sortedTranslations) {
      const regex = new RegExp(`\\b${russian}\\b`, 'gi');
      translated = translated.replace(regex, english);
    }
    
    SmartLogger.execute(`Промпт переведен: "${translated}"`);
    return translated;
  },

  /**
   * Добавление технических деталей и улучшений
   */
  addEnhancements(prompt, style = 'realistic') {
    SmartLogger.execute(`Добавление улучшений к промпту, стиль: ${style}`);
    
    let enhanced = prompt;
    
    // Базовые улучшения качества
    const qualityEnhancements = [
      'high quality', 'detailed', 'sharp focus', 'well-lit'
    ];
    
    // Стилевые улучшения в зависимости от типа
    const styleEnhancements = {
      realistic: [
        'photorealistic', 'hyperrealistic', 'professional photography',
        'studio lighting', 'natural colors', 'lifelike details'
      ],
      cartoon: [
        'cartoon style', 'animated', 'colorful', 'clean lines',
        'vibrant colors', 'stylized'
      ],
      artistic: [
        'artistic', 'creative', 'expressive', 'aesthetic',
        'beautiful composition', 'artistic lighting'
      ],
      print: [
        'vector style', 'clean lines', 'bold colors', 
        'print-ready', 'high contrast', 'simple shapes'
      ]
    };
    
    // Определяем стиль на основе содержимого
    let detectedStyle = style;
    if (prompt.includes('print') || prompt.includes('t-shirt') || prompt.includes('logo')) {
      detectedStyle = 'print';
    } else if (prompt.includes('cartoon') || prompt.includes('animated')) {
      detectedStyle = 'cartoon';
    } else if (prompt.includes('art') || prompt.includes('creative')) {
      detectedStyle = 'artistic';
    }
    
    // Добавляем улучшения
    const selectedEnhancements = [
      ...qualityEnhancements,
      ...(styleEnhancements[detectedStyle] || styleEnhancements.realistic)
    ];
    
    // Проверяем, что улучшения еще не добавлены
    const missingEnhancements = selectedEnhancements.filter(enhancement => 
      !enhanced.toLowerCase().includes(enhancement.toLowerCase())
    );
    
    if (missingEnhancements.length > 0) {
      enhanced = `${enhanced}, ${missingEnhancements.slice(0, 4).join(', ')}`;
    }
    
    SmartLogger.execute(`Промпт улучшен: "${enhanced.substring(0, 100)}..."`);
    return enhanced;
  },

  /**
   * Полная обработка промпта
   */
  async enhancePrompt(userQuery, style = 'realistic') {
    SmartLogger.execute(`=== НАЧАЛО УЛУЧШЕНИЯ ПРОМПТА ===`);
    SmartLogger.execute(`Исходный запрос: "${userQuery}"`);
    
    try {
      // Шаг 1: Очистка
      let processed = this.cleanPrompt(userQuery);
      
      // Шаг 2: Перевод
      processed = this.translateToEnglish(processed);
      
      // Шаг 3: Добавление деталей
      processed = this.addEnhancements(processed, style);
      
      // Шаг 4: AI-оптимизация (если доступна)
      try {
        const aiOptimized = await withTimeout(
          this.getAIOptimization(processed, style),
          12000, // 12 секунд для AI оптимизации
          'AI оптимизация промпта'
        );
        if (aiOptimized && aiOptimized.length > processed.length) {
          processed = aiOptimized;
          SmartLogger.execute(`AI оптимизация применена`);
        }
      } catch (aiError) {
        SmartLogger.execute(`AI оптимизация недоступна: ${aiError.message}`);
      }
      
      // Финальная очистка
      processed = processed.replace(/\s+/g, ' ').trim();
      processed = processed.replace(/,+/g, ',');
      processed = processed.replace(/^,|,$/, '');
      
      SmartLogger.execute(`=== ПРОМПТ УЛУЧШЕН ===`);
      SmartLogger.execute(`Финальный результат: "${processed}"`);
      
      return processed;
    } catch (error) {
      SmartLogger.execute(`Ошибка улучшения промпта: ${error.message}`);
      return userQuery; // Возвращаем оригинал при ошибке
    }
  },

  /**
   * AI-оптимизация промпта (опциональная)
   */
  async getAIOptimization(prompt, style) {
    const optimizationPrompt = `Improve this image generation prompt for ${style} style:

"${prompt}"

Make it more detailed and specific for AI image generation. Focus on:
- Visual composition and framing
- Lighting and atmosphere  
- Colors and mood
- Technical quality

Return only the improved prompt, no explanations.`;

    const g4fProvider = await import('./g4f-provider.js');
    const result = await withTimeout(
      g4fProvider.generateResponse(optimizationPrompt, {
        provider: 'Qwen_Qwen_2_72B',
        max_tokens: 150
      }),
      10000, // 10 секунд для оптимизации промпта
      'G4F оптимизация промпта'
    );
    
    if (result.success && result.response) {
      return result.response.trim();
    }
    
    throw new Error('AI optimization failed');
  }
};





/**
 * Выполнение плана получения времени
 */
async function executeTimeDatePlan(userQuery, options) {
  SmartLogger.execute(`Получаю текущее время и дату`);
  
  const reasons = [];
  reasons.push(`Распознал запрос "${userQuery}" как вопрос о времени/дате`);
  reasons.push('Получаю текущее время в московском часовом поясе');
  
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
  
  reasons.push('Форматирую время в удобном для чтения виде');
  
  let response = `Сейчас: ${timeStr} (московское время)`;
  
  // Применяем эмоциональную адаптацию
  if (options.emotional) {
    response = emotionalAnalyzer.generateEmotionalResponse(
      options.emotional, 
      response, 
      'time_date'
    );
    reasons.push(`Адаптировал ответ под эмоцию: ${options.emotional.dominantEmotion}`);
  }
  
  const finalReason = reasons.join(' → ');
  SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
  
  return {
    success: true,
    response: response,
    provider: 'IntelligentTimeProviderEmotional',
    category: 'time_date',
    emotionalTone: options.emotional?.overallTone || 'neutral',
    reason: finalReason
  };
}

/**
 * Выполнение плана команд памяти
 */
async function executeMemoryCommandPlan(plan, userQuery, options) {
  SmartLogger.execute(`Выполняю команду памяти: ${plan.command}`);
  
  const reasons = [];
  const sessionId = options.sessionId || 'default';
  
  reasons.push(`Обнаружена команда памяти: ${plan.command}`);
  
  try {
    // Выполняем команду памяти
    const commandResult = sessionMemory.processMemoryCommand(sessionId, plan.command, plan.params);
    reasons.push(`Команда "${plan.command}" выполнена успешно`);
    
    // Применяем эмоциональную адаптацию если есть эмоциональный контекст
    let response = commandResult;
    if (options.emotional) {
      response = emotionalAnalyzer.generateEmotionalResponse(
        options.emotional, 
        commandResult, 
        'memory_command'
      );
      reasons.push(`Адаптировал ответ под эмоцию: ${options.emotional.dominantEmotion}`);
    }
    
    const finalReason = reasons.join(' → ');
    SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
    
    return {
      success: true,
      response: response,
      provider: 'IntelligentMemoryManager',
      category: 'memory_command',
      command: plan.command,
      emotionalTone: options.emotional?.overallTone || 'neutral',
      reason: finalReason
    };
  } catch (error) {
    reasons.push(`Ошибка выполнения команды: ${error.message}`);
    const finalReason = reasons.join(' → ');
    SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
    return { success: false, shouldFallback: true, reason: finalReason };
  }
}

/**
 * Выполнение плана обычного общения
 */
async function executeConversationPlan(userQuery, options) {
  SmartLogger.execute(`Генерирую ответ для обычного общения`);
  
  const reasons = [];
  const sessionId = options.sessionId || 'default';
  
  reasons.push(`Классифицировал "${userQuery}" как обычное общение`);
  
  try {
    // Получаем эмоциональное состояние из опций
    const emotional = options.emotional || { dominantEmotion: 'neutral', overallTone: 'neutral' };
    
    reasons.push(`Проанализировал эмоциональное состояние: ${emotional.dominantEmotion}`);
    
    // Получаем контекст пользователя для более персонализированных ответов
    const userContext = sessionMemory.getUserContext(sessionId);
    reasons.push('Загрузил контекст пользователя из памяти сессии');
    
    // Адаптируем промпт под эмоциональное состояние и пользовательский контекст
    let conversationPrompt = `Ты дружелюбный AI-помощник с памятью о пользователе. `;
    
    // Добавляем контекст пользователя в промпт
    if (userContext && userContext.length > 50) {
      conversationPrompt += `

${userContext}

Учитывай этот контекст в своём ответе. `;
      reasons.push('Добавил пользовательский контекст в промпт');
    }
    
    // Настраиваем стиль ответа под эмоцию пользователя
    switch (emotional.dominantEmotion) {
      case 'joy':
        conversationPrompt += `Пользователь в хорошем настроении! Отвечай позитивно и энергично. `;
        reasons.push('Настроил позитивный и энергичный стиль ответа');
        break;
      case 'anger':
        conversationPrompt += `Пользователь расстроен или раздражён. Отвечай спокойно, понимающе и конструктивно. `;
        reasons.push('Настроил спокойный и понимающий стиль ответа');
        break;
      case 'sadness':
        conversationPrompt += `Пользователь грустит или устал. Отвечай поддерживающе и ободряюще. `;
        reasons.push('Настроил поддерживающий и ободряющий стиль ответа');
        break;
      case 'surprise':
        conversationPrompt += `Пользователь удивлён или любопытен. Отвечай интересно и познавательно. `;
        reasons.push('Настроил интересный и познавательный стиль ответа');
        break;
      case 'polite':
        conversationPrompt += `Пользователь очень вежлив. Отвечай также вежливо и учтиво. `;
        reasons.push('Настроил вежливый и учтивый стиль ответа');
        break;
      default:
        conversationPrompt += `Отвечай естественно и дружелюбно. `;
        reasons.push('Использую нейтральный дружелюбный стиль ответа');
    }
    
    conversationPrompt += `

Пользователь: "${userQuery}"

Ответь в соответствии с настроением пользователя. Если можешь помочь чем-то конкретным, предложи это.`;

    reasons.push('Отправляю запрос к AI модели Qwen_Qwen_2_72B для генерации ответа');

    const g4fProvider = await import('./g4f-provider.js');
    const result = await withTimeout(
      g4fProvider.generateResponse(conversationPrompt, {
        provider: 'Qwen_Qwen_2_72B',
        max_tokens: 250
      }),
      15000, // 15 секунд для генерации ответа в разговоре
      'G4F генерация ответа для разговора'
    );
    
    if (result.success && result.response) {
      reasons.push('AI сгенерировал ответ, применяю эмоциональную адаптацию');
      
      // Применяем эмоциональную адаптацию к ответу
      const adaptedResponse = emotionalAnalyzer.generateEmotionalResponse(
        emotional, 
        result.response.trim(), 
        'conversation'
      );
      
      reasons.push('Финализировал ответ с учетом эмоционального контекста');
      
      const finalReason = reasons.join(' → ');
      SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
      
      return {
        success: true,
        response: adaptedResponse,
        provider: 'IntelligentConversationEmotionalMemory',
        category: 'conversation',
        emotionalTone: emotional.overallTone,
        hasUserContext: userContext.length > 50,
        reason: finalReason
      };
    }
    
    reasons.push('AI не смог сгенерировать ответ, перехожу к стандартной логике');
    const finalReason = reasons.join(' → ');
    SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
    return { success: false, shouldFallback: true, reason: finalReason };
  } catch (error) {
    reasons.push(`Ошибка генерации: ${error.message}`);
    const finalReason = reasons.join(' → ');
    SmartLogger.execute(`ПРИЧИНЫ ДЕЙСТВИЙ: ${finalReason}`);
    return { success: false, shouldFallback: true, reason: finalReason };
  }
}

/**
 * Главная функция интеллектуального процессора
 * Анализирует запрос и выполняет оптимальный план действий
 */
async function analyzeAndExecute(userQuery, options = {}) {
  SmartLogger.brain(`=== ЗАПУСК ИНТЕЛЛЕКТУАЛЬНОГО АНАЛИЗА ===`);
  SmartLogger.brain(`Запрос: "${userQuery}"`);
  SmartLogger.brain(`SessionId: ${options.sessionId || 'default'}`);
  
  const globalReasons = [];
  globalReasons.push('Запустил интеллектуальный анализ запроса пользователя');
  
  try {
    // Шаг 1: Анализ намерений (включая проверку команд памяти)
    globalReasons.push('Анализирую намерения пользователя (грамматика + эмоции + контекст + память)');
    const intent = await analyzeUserIntent(userQuery, options);
    
    globalReasons.push(`Определил категорию: ${intent.category} (уверенность: ${intent.confidence}%)`);
    
    // Специальная обработка для команд памяти - они всегда должны выполняться
    if (intent.category === 'memory_command') {
      globalReasons.push('Обнаружена команда памяти - выполняю напрямую');
      const plan = { 
        category: 'memory_command', 
        description: 'Выполнение команды управления памятью',
        command: intent.command,
        params: intent.params,
        shouldExecute: true,
        confidence: intent.confidence,
        grammar: intent.grammar,
        context: intent.context,
        emotional: intent.emotional
      };
      
      const result = await executeMemoryCommandPlan(plan, userQuery, options);
      
      if (result.success) {
        globalReasons.push('Команда памяти выполнена успешно');
        const finalGlobalReason = globalReasons.join(' → ');
        SmartLogger.brain(`=== ФИНАЛЬНЫЕ ПРИЧИНЫ: ${finalGlobalReason} ===`);
        
        result.globalReason = finalGlobalReason;
        if (result.reason) {
          result.fullReason = `${finalGlobalReason} | ДЕТАЛИ: ${result.reason}`;
        }
        
        SmartLogger.brain(`=== КОМАНДА ПАМЯТИ ВЫПОЛНЕНА ===`);
        return result;
      }
    }
    
    // Шаг 2: Создание плана
    globalReasons.push('Создаю план действий на основе намерений');
    const plan = await createActionPlan(intent, options);
    
    globalReasons.push(`План: ${plan.description} (порог: ${intent.smartThreshold}%)`);
    
    // Шаг 3: Выполнение плана (используем умные пороги)
    if (plan.shouldExecute) {
      globalReasons.push(`Уверенность ${plan.confidence}% превышает порог ${intent.smartThreshold}%, выполняю план`);
      SmartLogger.brain(`Выполняем план с уверенностью ${plan.confidence}% (порог пройден)`);
      
      const result = await executePlan(plan, userQuery, options);
      
      if (result.success) {
        globalReasons.push('План успешно выполнен');
        const finalGlobalReason = globalReasons.join(' → ');
        SmartLogger.brain(`=== ФИНАЛЬНЫЕ ПРИЧИНЫ: ${finalGlobalReason} ===`);
        
        // Добавляем глобальную причину к результату
        result.globalReason = finalGlobalReason;
        if (result.reason) {
          result.fullReason = `${finalGlobalReason} | ДЕТАЛИ: ${result.reason}`;
        }
        
        SmartLogger.brain(`=== УСПЕШНОЕ ВЫПОЛНЕНИЕ ПЛАНА ===`);
        return result;
      } else if (result.shouldFallback) {
        globalReasons.push('План не сработал, перехожу к стандартной логике');
        const finalGlobalReason = globalReasons.join(' → ');
        SmartLogger.brain(`=== ФИНАЛЬНЫЕ ПРИЧИНЫ: ${finalGlobalReason} ===`);
        SmartLogger.brain(`=== ПЕРЕХОД К СТАНДАРТНОЙ ЛОГИКЕ ===`);
        return { success: false, shouldFallback: true, globalReason: finalGlobalReason };
      }
    }
    
    // Если план не подходит, используем стандартную логику
    globalReasons.push(`Уверенность ${plan.confidence}% ниже порога ${intent.smartThreshold}%, использую стандартную логику`);
    const finalGlobalReason = globalReasons.join(' → ');
    SmartLogger.brain(`=== ФИНАЛЬНЫЕ ПРИЧИНЫ: ${finalGlobalReason} ===`);
    SmartLogger.brain(`=== ПЛАН НЕ ПРОШЕЛ УМНЫЙ ПОРОГ, ПЕРЕХОД К СТАНДАРТНОЙ ЛОГИКЕ ===`);
    SmartLogger.brain(`Уверенность: ${plan.confidence}%, требуемый порог: ${intent.smartThreshold}%`);
    return { success: false, shouldFallback: true, globalReason: finalGlobalReason };
    
  } catch (error) {
    globalReasons.push(`Критическая ошибка: ${error.message}`);
    const finalGlobalReason = globalReasons.join(' → ');
    SmartLogger.brain(`=== ФИНАЛЬНЫЕ ПРИЧИНЫ: ${finalGlobalReason} ===`);
    SmartLogger.brain(`=== ОШИБКА АНАЛИЗА: ${error.message} ===`);
    return { success: false, shouldFallback: true, error: error.message, globalReason: finalGlobalReason };
  }
}

module.exports = {
  analyzeAndExecute,
  analyzeUserIntent,
  createActionPlan,
  executePlan
};