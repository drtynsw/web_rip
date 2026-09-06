import { Injectable } from '@nestjs/common';

export interface VulnerabilityRequest {
  id: number;
  systemName: string;      // название оцениваемой системы
  createdDate: string;     // дата создания заявки
  status: string;          // статус заявки (черновик/на рассмотрении/завершена)
  vectorIds: number[];     // выбранные векторы атак
  protectionLevel: number; // усреднённый уровень защищённости имеющимися мерами, %
  riskLevel: string;       // итоговый уровень риска (низкий/средний/высокий)
}

@Injectable()
export class RequestsService {
  private requests: VulnerabilityRequest[] = [
    {
      id: 1,
      systemName: 'Интернет-магазин "BMSTU Shop"',
      createdDate: '2026-08-10',
      status: 'На рассмотрении',
      vectorIds: [1, 2, 3],
      protectionLevel: 40,
      riskLevel: 'Высокий',
    },
    {
      id: 2,
      systemName: 'Корпоративный портал сотрудников',
      createdDate: '2026-08-15',
      status: 'Черновик',
      vectorIds: [4, 5],
      protectionLevel: 70,
      riskLevel: 'Средний',
    },
    {
      id: 3,
      systemName: 'API платёжного шлюза',
      createdDate: '2026-08-20',
      status: 'Завершена',
      vectorIds: [1, 2],
      protectionLevel: 85,
      riskLevel: 'Низкий',
    },
  ];

  findAll(query?: string): VulnerabilityRequest[] {
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      return this.requests.filter((r) =>
        r.systemName.toLowerCase().includes(q),
      );
    }
    return this.requests;
  }

  findOne(id: number): VulnerabilityRequest | undefined {
    return this.requests.find((r) => r.id === id);
  }
}
