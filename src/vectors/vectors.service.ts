import { Injectable } from '@nestjs/common';

export type VectorStatus = 'draft' | 'published' | 'deleted';

export interface AttackVector {
  id: number;
  title: string;              // название вектора атаки
  category: string;           // категория (сетевая/веб/социальная и т.д.)
  description: string;        // описание механизма атаки (текст)
  severity: number;           // предметное поле 1: базовая опасность, число 1-10
  discoveredYear: number;     // предметное поле 2: год первой массовой фиксации, число
  status: VectorStatus;       // draft | published | deleted
  imageKey: string;           // ключ изображения в MinIO (латиница)
  videoKey: string;           // ключ видео в MinIO (латиница)
  likes: number[];            // массив ID пользователей, поставивших лайк
}

@Injectable()
export class VectorsService {
  private vectors: AttackVector[] = [
    {
      id: 1,
      title: 'DDoS-атака',
      category: 'Сетевая атака',
      description:
        'Распределённая атака типа «отказ в обслуживании» — злоумышленник перегружает систему множеством запросов с разных источников (ботнетом), из-за чего сервис становится недоступен легитимным пользователям. Одна из первых громких DDoS-атак была зафиксирована в 1999–2000 годах против Yahoo!, eBay и CNN.',
      severity: 8,
      discoveredYear: 1999,
      status: 'published',
      imageKey: 'ddos.png',
      videoKey: 'ddos.mp4',
      likes: [101, 205, 318],
    },
    {
      id: 2,
      title: 'SQL-инъекция',
      category: 'Веб-уязвимость',
      description:
        'Внедрение вредоносного SQL-кода через поля ввода, что позволяет злоумышленнику читать, изменять или удалять данные в базе данных, а иногда — получить контроль над сервером. Впервые публично описана исследователем Джеффом Форристалом в 1998 году.',
      severity: 9,
      discoveredYear: 1998,
      status: 'published',
      imageKey: 'sqli.png',
      videoKey: 'sqli.mp4',
      likes: [101, 142],
    },
    {
      id: 3,
      title: 'XSS (межсайтовый скриптинг)',
      category: 'Веб-уязвимость',
      description:
        'Внедрение вредоносного JavaScript-кода в страницу, который выполняется в браузере другого пользователя, позволяя красть куки, токены сессий и совершать действия от имени жертвы. Термин «Cross-Site Scripting» ввела компания Microsoft в 2000 году.',
      severity: 6,
      discoveredYear: 2000,
      status: 'published',
      imageKey: 'xss.png',
      videoKey: 'xss.mp4',
      likes: [205],
    },
    {
      id: 4,
      title: 'Брутфорс паролей',
      category: 'Атака на аутентификацию',
      description:
        'Автоматизированный перебор комбинаций логина и пароля с целью получения несанкционированного доступа к учётной записи. Массово применяется с начала 2000-х вместе с ростом доступных вычислительных мощностей.',
      severity: 5,
      discoveredYear: 2003,
      status: 'published',
      imageKey: 'bruteforce.png',
      videoKey: 'bruteforce.mp4',
      likes: [],
    },
    {
      id: 5,
      title: 'Фишинг',
      category: 'Социальная инженерия',
      description:
        'Рассылка поддельных сообщений от имени доверенных источников с целью выманить у пользователя учётные данные или заставить его выполнить вредоносное действие. Термин «phishing» впервые зафиксирован в 1996 году в чатах America Online.',
      severity: 4,
      discoveredYear: 1996,
      status: 'published',
      imageKey: 'phishing.png',
      videoKey: 'phishing.mp4',
      likes: [318, 402, 55, 9],
    },
    {
      id: 6,
      title: 'Атака посредника (MITM)',
      category: 'Сетевая атака',
      description:
        'Черновик описания: злоумышленник перехватывает и, возможно, подменяет трафик между двумя сторонами, которые считают, что общаются напрямую друг с другом.',
      severity: 7,
      discoveredYear: 2010,
      status: 'draft',
      imageKey: 'mitm.png',
      videoKey: 'mitm.mp4',
      likes: [],
    },
    {
      id: 7,
      title: 'Устаревший вектор (пример удалённого)',
      category: 'Архив',
      description: 'Эта услуга удалена и не должна отображаться в интерфейсе.',
      severity: 1,
      discoveredYear: 2001,
      status: 'deleted',
      imageKey: 'legacy.png',
      videoKey: 'legacy.mp4',
      likes: [],
    },
  ];

  findPublished(minSeverity?: number): AttackVector[] {
    let result = this.vectors.filter((v) => v.status === 'published');
    if (minSeverity !== undefined && !Number.isNaN(minSeverity)) {
      result = result.filter((v) => v.severity >= minSeverity);
    }
    return result;
  }

  findDraft(): AttackVector | undefined {
    return this.vectors.find((v) => v.status === 'draft');
  }

  findById(id: number): AttackVector | undefined {
    return this.vectors.find((v) => v.id === id);
  }

  findNextPublished(afterId: number): AttackVector | undefined {
    const published = this.vectors.filter((v) => v.status === 'published');
    const idx = published.findIndex((v) => v.id === afterId);
    if (idx === -1 || published.length === 0) return published[0];
    return published[(idx + 1) % published.length];
  }

  likesCount(vector: AttackVector): number {
    return vector.likes.length;
  }
}
