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
    return result;
  }

  result.isCreationIntent = true;

  // Ищем визуальные объекты
  for (const obj of visualObjects) {
    if (lowerQuery.includes(obj)) {
      result.type = 'visual';
      result.confidence = Math.min(90, result.confidence + 30);
      result.detectedObject = obj;
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
        break;
      }
    }
  }

  // Специальная логика для одиночного "создай"
  if (lowerQuery.trim() === 'создай' || lowerQuery.trim() === 'сделай') {
    result.type = 'ambiguous';
    result.confidence = 5; // Очень низкая уверенность
  }

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

    } else {
      session.topics.push(topicRecord);
      session.statistics.topicsDiscussed = session.topics.length;

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
  }

  // Вычисляем уверенность в анализе
  analysis.confidence = Math.min(
    (analysis.questionWords.length + analysis.commandWords.length + analysis.timeIndicators.length) * 25,
    100
  );

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
  } else if (grammar.isCommand && grammar.tense === 'future') {
    // "создай завтра" - четкая команда, повышаем порог
    baseThreshold = 25;
  } else if (grammar.isQuestion) {
    // Обычный вопрос - средний порог
    baseThreshold = 10;
  } else if (grammar.isCommand) {
    // Обычная команда - стандартный порог
    baseThreshold = 20;
  }

  // Адаптация на основе контекста
  if (category === 'image_generation') {
    if (context.hasRecentImage && grammar.isQuestion) {
      // Есть недавнее изображение и это вопрос - скорее всего вопрос об изображении
      baseThreshold = 3;
    } else if (!context.hasRecentImage && grammar.isCommand) {
      // Нет недавнего изображения и это команда - вероятно генерация
      baseThreshold = 25;
    }
  }

  return baseThreshold;
}

// Сервисы будут импортированы динамически при необходимости

/**
 * Основная функция интеллектуального процессора
 * Анализирует запрос и выполняет оптимальный план действий
 */
async function analyzeAndExecute(userQuery, options = {}) {
  SmartLogger.brain(`=== ЗАПУСК ИНТЕЛЛЕКТУАЛЬНОГО АНАЛИЗА ===`);
  SmartLogger.brain(`Запрос: "${userQuery}"`);
  SmartLogger.brain(`SessionId: ${options.sessionId || 'default'}`);

  const globalReasons = [];
  globalReasons.push('Запустил интеллектуальный анализ запроса пользователя');

  try {
    // Получаем контекст сессии для анализа
    const sessionId = options.sessionId || 'default';
    const conversationMemory = require('./conversation-memory');
    const contextData = conversationMemory.getMessageContext(sessionId, userQuery);

    globalReasons.push('Загрузил контекст беседы из памяти');
    SmartLogger.brain(`Контекст беседы: ${contextData.context ? 'Найден' : 'Пустой'}`);

    // Шаг 1: Анализ намерений с учетом контекста беседы
    globalReasons.push('Анализирую намерения пользователя (грамматика + эмоции + контекст + память)');
    const enhancedOptions = {
      ...options,
      conversationContext: contextData
    };
    const intent = await analyzeUserIntent(userQuery, enhancedOptions);

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

/**
 * Анализ намерений пользователя с учетом контекста
 */
async function analyzeUserIntent(userQuery, options = {}) {
  const startTime = Date.now();
  SmartLogger.brain(`Анализирую намерения для: "${userQuery}"`);

  const sessionId = options.sessionId || 'default';
  const conversationContext = options.conversationContext || {};

  // Получаем контекст действий из памяти
  const actionContext = actionMemory.getActionContext();
  SmartLogger.brain('Контекст действий:', actionContext);

  // Анализируем грамматику запроса
  const grammar = analyzeGrammar(userQuery);
  SmartLogger.grammar('Грамматический анализ:', grammar);

  // Анализируем эмоциональное состояние
  const emotional = emotionalAnalyzer.analyzeEmotion(userQuery);
  SmartLogger.emotion('Эмоциональный анализ:', emotional);

  // Проверяем команды памяти
  const memoryCommandResult = checkMemoryCommands(userQuery);
  if (memoryCommandResult.isMemoryCommand) {
    return {
      category: 'memory_command',
      confidence: 95,
      command: memoryCommandResult.command,
      params: memoryCommandResult.params,
      grammar,
      emotional,
      context: actionContext,
      smartThreshold: 80,
      processingTime: Date.now() - startTime
    };
  }

  // Анализ контекста создания
  const creationContext = analyzeCreationContext(userQuery);
  SmartLogger.brain('Контекст создания:', creationContext);

  // Определяем категорию на основе анализа
  let category = 'general';
  let confidence = 0;

  // Проверка на генерацию изображений
  if (creationContext.isCreationIntent && creationContext.type === 'visual') {
    category = 'image_generation';
    confidence = creationContext.confidence;
  }
  // Проверка на веб-поиск
  else if (needsWebSearch(userQuery)) {
    category = 'web_search';
    confidence = 75;
  }
  // Проверка на вопросы о прошлых действиях
  else if (grammar.isQuestion && grammar.tense === 'past') {
    if (actionContext.hasRecentImage) {
      category = 'action_inquiry';
      confidence = 80;
    } else {
      category = 'general_inquiry';
      confidence = 40;
    }
  }

  // Вычисляем умный порог
  const smartThreshold = calculateSmartThreshold(grammar, actionContext, category);

  const result = {
    category,
    confidence,
    grammar,
    emotional,
    context: actionContext,
    creationContext,
    conversationContext,
    smartThreshold,
    processingTime: Date.now() - startTime
  };

  SmartLogger.brain(`Результат анализа намерений:`, result);
  return result;
}

/**
 * Создание плана действий на основе намерений
 */
async function createActionPlan(intent, options = {}) {
  SmartLogger.plan(`Создаю план для категории: ${intent.category}`);

  const plan = {
    category: intent.category,
    confidence: intent.confidence,
    shouldExecute: intent.confidence >= intent.smartThreshold,
    description: 'Общий план действий',
    grammar: intent.grammar,
    context: intent.context,
    emotional: intent.emotional
  };

  switch (intent.category) {
    case 'image_generation':
      plan.description = 'Генерация изображения через AI';
      plan.service = 'ai-image-generator';
      break;

    case 'web_search':
      plan.description = 'Поиск актуальной информации в интернете';
      plan.service = 'web-search-provider';
      break;

    case 'action_inquiry':
      plan.description = 'Ответ на вопрос о последних действиях';
      plan.service = 'action-memory';
      break;

    case 'memory_command':
      plan.description = 'Выполнение команды управления памятью';
      plan.service = 'session-memory';
      plan.command = intent.command;
      plan.params = intent.params;
      plan.shouldExecute = true; // Команды памяти всегда выполняются
      break;

    default:
      plan.description = 'Стандартная обработка через AI';
      plan.service = 'standard-ai';
      break;
  }

  SmartLogger.plan(`План создан:`, plan);
  return plan;
}

/**
 * Выполнение плана действий
 */
async function executePlan(plan, userQuery, options = {}) {
  SmartLogger.execute(`Выполняю план: ${plan.description}`);

  try {
    let result = { success: false, shouldFallback: true };

    switch (plan.service) {
      case 'ai-image-generator':
        result = await executeImageGeneration(userQuery, options);
        break;

      case 'web-search-provider':
        result = await executeWebSearch(userQuery, options);
        break;

      case 'action-memory':
        result = await executeActionInquiry(userQuery, plan.context);
        break;

      case 'session-memory':
        result = await executeMemoryCommand(plan, userQuery, options);
        break;

      default:
        result = { success: false, shouldFallback: true };
        break;
    }

    // Сохраняем выполненное действие в памяти
    if (result.success) {
      actionMemory.saveAction({
        category: plan.category,
        description: plan.description,
        userQuery,
        result: result.response ? result.response.substring(0, 100) : 'success'
      });
    }

    return result;

  } catch (error) {
    SmartLogger.execute(`Ошибка выполнения плана: ${error.message}`);
    return { success: false, shouldFallback: true, error: error.message };
  }
}

/**
 * Выполнение команды памяти
 */
async function executeMemoryCommandPlan(plan, userQuery, options = {}) {
  const sessionId = options.sessionId || 'default';
  const response = sessionMemory.processMemoryCommand(sessionId, plan.command, plan.params);

  return {
    success: true,
    response: response,
    provider: 'SessionMemory',
    category: 'memory_command'
  };
}

/**
 * Проверка команд управления памятью
 */
function checkMemoryCommands(query) {
  const lowerQuery = query.toLowerCase().trim();

  // Паттерны команд памяти
  const memoryPatterns = [
    { pattern: /^set\s*user\s*name\s+(.+)$/i, command: 'setUserName', extract: 1 },
    { pattern: /^add\s*goal\s+(.+)$/i, command: 'addGoal', extract: 1 },
    { pattern: /^remember\s*topic\s+(.+)$/i, command: 'rememberTopic', extract: 1 },
    { pattern: /^show\s*memory$/i, command: 'showMemory', extract: 0 },
    { pattern: /^clear\s*memory$/i, command: 'clearMemory', extract: 0 }
  ];

  for (const { pattern, command, extract } of memoryPatterns) {
    const match = lowerQuery.match(pattern);
    if (match) {
      const params = extract > 0 ? [match[extract]] : [];
      return {
        isMemoryCommand: true,
        command,
        params
      };
    }
  }

  return { isMemoryCommand: false };
}

/**
 * Проверка необходимости веб-поиска
 */
function needsWebSearch(query) {
  const searchKeywords = [
    'найди', 'поищи', 'найти', 'поиск', 'новости', 'последние',
    'актуальные', 'свежие', 'что происходит', 'что случилось',
    'курс', 'цена', 'стоимость', 'погода', 'информация о'
  ];

  const lowerQuery = query.toLowerCase();
  return searchKeywords.some(keyword => lowerQuery.includes(keyword));
}

/**
 * Выполнение генерации изображения
 */
async function executeImageGeneration(userQuery, options = {}) {
  try {
    const aiImageGenerator = require('./ai-image-generator');
    const result = await aiImageGenerator.generateImage(userQuery, 'realistic');

    if (result.success && result.imageUrl) {
      return {
        success: true,
        response: `Я создал изображение по вашему запросу! Вот результат:\n\n![Сгенерированное изображение](${result.imageUrl})\n\nИзображение сохранено и готово к использованию.`,
        provider: 'AI_Image_Generator',
        imageUrl: result.imageUrl,
        category: 'image_generation'
      };
    }

    return { success: false, shouldFallback: true };
  } catch (error) {
    return { success: false, shouldFallback: true, error: error.message };
  }
}

/**
 * Выполнение веб-поиска
 */
async function executeWebSearch(userQuery, options = {}) {
  try {
    const webSearchProvider = require('./web-search-provider');
    const searchResults = await webSearchProvider.performWebSearch(userQuery);

    if (searchResults.success && searchResults.results.length > 0) {
      const formattedResponse = `🔍 **Найдена актуальная информация:**\n\n${searchResults.results.slice(0, 5).map((r, i) => 
        `**${i + 1}. ${r.title}**\n${r.snippet}\n🔗 [Источник](${r.url})\n`
      ).join('\n')}📊 **Всего найдено:** ${searchResults.results.length}`;

      return {
        success: true,
        response: formattedResponse,
        provider: 'WebSearch',
        category: 'web_search',
        searchResults: searchResults.results
      };
    }

    return { success: false, shouldFallback: true };
  } catch (error) {
    return { success: false, shouldFallback: true, error: error.message };
  }
}

/**
 * Ответ на вопросы о действиях
 */
async function executeActionInquiry(userQuery, actionContext) {
  if (actionContext.hasRecentImage) {
    const lastImage = actionMemory.getLastImage();
    const timeAgo = Math.round((Date.now() - lastImage.timestamp) / (1000 * 60));

    return {
      success: true,
      response: `Недавно я создал изображение (${timeAgo} минут назад). Оно было сгенерировано по запросу пользователя и сохранено для использования.`,
      provider: 'ActionMemory',
      category: 'action_inquiry'
    };
  }

  if (actionContext.totalActions > 0) {
    const lastAction = actionMemory.getLastAction();
    return {
      success: true,
      response: `Последнее действие: ${lastAction.description} (категория: ${lastAction.category})`,
      provider: 'ActionMemory',
      category: 'action_inquiry'
    };
  }

  return {
    success: true,
    response: 'В этой сессии я пока не выполнял значимых действий.',
    provider: 'ActionMemory',
    category: 'action_inquiry'
  };
}

/**
 * Выполнение команды памяти
 */
async function executeMemoryCommand(plan, userQuery, options = {}) {
  const sessionId = options.sessionId || 'default';
  const response = sessionMemory.processMemoryCommand(sessionId, plan.command, plan.params);

  return {
    success: true,
    response: response,
    provider: 'SessionMemory',
    category: 'memory_command'
  };
}

module.exports = {
  analyzeAndExecute,
  analyzeUserIntent,
  createActionPlan,
  executePlan
};