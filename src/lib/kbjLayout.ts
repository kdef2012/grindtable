import { TableElement } from '@/types';

export function getKbjWinstonSalemLayout(): TableElement[] {
  const elements: TableElement[] = [];
  
  const add = (el: Partial<TableElement>) => {
    elements.push({
      id: `t_${Math.random().toString(36).substr(2, 9)}`,
      number: el.number || '0',
      capacity: el.capacity || 4,
      type: el.type || '4_top',
      shape: el.shape || 'square',
      zone: el.zone || 'main',
      position: el.position || { x: 0, y: 0 },
      currentStatus: 'available',
      width: el.width,
      height: el.height,
    });
  };

  // COLUMN 1: Left Wall Booths
  const col1X = 100;
  [11, 12, 13, 14, 15, 16, 17].forEach((num, index) => {
    add({ number: num.toString(), type: '4_booth', capacity: 4, position: { x: col1X, y: 100 + index * 120 } });
  });

  // COLUMN 2: 4-Tops
  const col2X = 250;
  [21, 22, 23, 24, 25, 26, 27].forEach((num, index) => {
    add({ number: num.toString(), type: '4_top', shape: 'square', capacity: 4, position: { x: col2X, y: 100 + index * 120 } });
  });

  // COLUMN 3 & 4: Back-to-Back Booths (31-35 are 4-seaters, 41-45 are 6-seaters)
  const col3X = 400;
  const col4X = 500;
  [31, 32, 33, 34, 35].forEach((num, index) => {
    // 30s are 4-seater booths
    add({ number: num.toString(), type: '4_booth', capacity: 4, position: { x: col3X, y: 100 + index * 120 } });
    // 40s are 6-seater booths
    add({ number: (num + 10).toString(), type: 'booth', capacity: 6, shape: 'rectangle', position: { x: col4X, y: 100 + index * 120 } });
  });

  // COLUMN 5: 51,53,54 = 6-tops. 52,55 = 4-tops.
  const col5X = 650;
  [51, 52, 53, 54, 55].forEach((num, index) => {
    if (num === 52 || num === 55) {
      add({ number: num.toString(), type: '4_top', shape: 'square', capacity: 4, position: { x: col5X, y: 100 + index * 120 } });
    } else {
      add({ number: num.toString(), type: '6_top', shape: 'rectangle', capacity: 6, position: { x: col5X, y: 100 + index * 120 } });
    }
  });

  // THE BAR
  const barX = 850;
  const barY = 150;
  const barWidth = 350;
  const barHeight = 450;
  add({ number: 'BAR', type: 'bar', shape: 'u_shaped', capacity: 0, position: { x: barX, y: barY }, width: barWidth, height: barHeight });

  const stool = (idStr: string, x: number, y: number) => {
    add({ number: idStr, type: 'bar_seat', shape: 'round', capacity: 1, position: { x, y } });
  };
  
  for (let i = 0; i < 8; i++) stool(`BL-${i+1}`, barX - 30, barY + 20 + i * 40);
  stool('BLC-1', barX - 20, barY + 360);
  stool('BLC-2', barX, barY + 410);
  for (let i = 0; i < 6; i++) stool(`BF-${i+1}`, barX + 50 + i * 40, barY + barHeight + 10);
  stool('BRC-1', barX + barWidth - 30, barY + 410);
  stool('BRC-2', barX + barWidth + 10, barY + 360);
  for (let i = 0; i < 8; i++) stool(`BR-${i+1}`, barX + barWidth + 10, barY + 20 + i * 40);

  // ROW 6: Center Bottom (61-63 are 4-tops, 64 is 6-top)
  [61, 62, 63, 64].forEach((num, index) => {
    if (num === 64) {
      add({ number: num.toString(), type: '6_top', shape: 'rectangle', capacity: 6, position: { x: 650 + index * 120, y: 700 } });
    } else {
      add({ number: num.toString(), type: '4_top', shape: 'square', capacity: 4, position: { x: 650 + index * 120, y: 700 } });
    }
  });

  // ROW 7: Bottom Right (71 is 4-top, 72 is 6-top, 73 is 10-top)
  add({ number: '71', type: '4_top', shape: 'square', capacity: 4, position: { x: 900, y: 820 } });
  add({ number: '72', type: '6_top', shape: 'rectangle', capacity: 6, position: { x: 1020, y: 820 } });
  add({ number: '73', type: '8_top', shape: 'rectangle', capacity: 10, position: { x: 1150, y: 820 }, width: 180, height: 80 });

  // COLUMN 6: Right Side Tables (81-84 are 4-tops)
  const col6X = 1300;
  [81, 82, 83, 84].forEach((num, index) => {
    add({ number: num.toString(), type: '4_top', shape: 'square', capacity: 4, position: { x: col6X, y: 100 + index * 120 } });
  });

  // COLUMN 7: Right Wall Booths
  const col7X = 1450;
  [91, 92, 93, 94, 95, 96].forEach((num, index) => {
    const yPos = index >= 4 ? 100 + (index + 0.5) * 120 : 100 + index * 120;
    add({ number: num.toString(), type: '4_booth', capacity: 4, position: { x: col7X, y: yPos } });
  });

  // Entrance & Host Stand Block
  add({ number: 'ENTRANCE', type: 'restroom', shape: 'rectangle', capacity: 0, position: { x: 800, y: 950 }, width: 200, height: 40 });
  add({ number: 'HOST', type: 'restroom', shape: 'square', capacity: 0, position: { x: 500, y: 850 }, width: 80, height: 80 });

  return elements;
}
