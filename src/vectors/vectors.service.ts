import { Injectable } from '@nestjs/common';

export interface AttackVector {
  id: number;
  title: string;          // название вектора атаки
  category: string;       // категория (сетевая/веб/социальная и т.д.)
  description: string;    // описание механизма атаки
  baseSeverity: number;   // базовая степень опасности, 1-10
  image: string;          // изображение-иконка
}

@Injectable()
export class VectorsService {
  private vectors: AttackVector[] = [
    {
      id: 1,
      title: 'DDoS-атака',
      category: 'Сетевая атака',
      description:
        'Распределённая атака типа "отказ в обслуживании" — злоумышленник перегружает систему множеством запросов с разных источников, из-за чего сервис становится недоступен легитимным пользователям.',
      baseSeverity: 8,
      image: '/images/ddos.svg',
    },
    {
      id: 2,
      title: 'SQL-инъекция',
      category: 'Веб-уязвимость',
      description:
        'Внедрение вредоносного SQL-кода через поля ввода, что позволяет злоумышленнику читать, изменять или удалять данные в базе данных, а иногда — получить контроль над сервером.',
      baseSeverity: 9,
      image: '/images/sqli.svg',
    },
    {
      id: 3,
      title: 'XSS (межсайтовый скриптинг)',
      category: 'Веб-уязвимость',
      description:
        'Внедрение вредоносного JavaScript-кода в страницу, который выполняется в браузере другого пользователя, позволяя красть куки, токены сессий и совершать действия от имени жертвы.',
      baseSeverity: 6,
      image: '/images/xss.svg',
    },
    {
      id: 4,
      title: 'Брутфорс паролей',
      category: 'Атака на аутентификацию',
      description:
        'Автоматизированный перебор комбинаций логина и пароля с целью получения несанкционированного доступа к учётной записи.',
      baseSeverity: 5,
      image: '/images/bruteforce.svg',
    },
    {
      id: 5,
      title: 'Фишинг',
      category: 'Социальная инженерия',
      description:
        'Рассылка поддельных сообщений от имени доверенных источников с целью выманить у пользователя учётные данные или заставить его выполнить вредоносное действие.',
      baseSeverity: 4,
      image: '/images/phishing.svg',
    },
  ];

  findAll(query?: string): AttackVector[] {
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      return this.vectors.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.category.toLowerCase().includes(q),
      );
    }
    return this.vectors;
  }

  findOne(id: number): AttackVector | undefined {
    return this.vectors.find((v) => v.id === id);
  }
}
