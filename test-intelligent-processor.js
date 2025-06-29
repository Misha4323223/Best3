/**
 * Тест интеллектуального процессора чата
 * Проверяем работу "невидимого мозга" приложения
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const intelligentProcessor = require('./server/intelligent-chat-processor');

async function testProcessor() {
  console.log('🧠 Тестирование интеллектуального процессора...\n');
  
  const testQueries = [
    'Какая погода в Москве?',
    'Нарисуй красивую собаку',
    'Сделай SVG из изображения',
    'Привет, как дела?',
    'Который сейчас час?',
    'Что такое блокчейн?'
  ];
  
  for (const query of testQueries) {
    console.log(`\n📝 Тестирую запрос: "${query}"`);
    console.log('=' .repeat(50));
    
    try {
      const result = await intelligentProcessor.analyzeAndExecute(query, {
        sessionId: 'test-session'
      });
      
      console.log(`✅ Результат:`, {
        success: result.success,
        provider: result.provider,
        category: result.category,
        shouldFallback: result.shouldFallback
      });
      
      if (result.response) {
        console.log(`📄 Ответ: ${result.response.substring(0, 200)}...`);
      }
      
    } catch (error) {
      console.error(`❌ Ошибка: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Тестирование завершено!');
}

testProcessor().catch(console.error);