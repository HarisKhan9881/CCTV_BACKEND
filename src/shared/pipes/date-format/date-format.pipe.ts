import { ArgumentMetadata, Injectable, PipeTransform,BadRequestException } from '@nestjs/common';

@Injectable()
export class DateFormatPipe implements PipeTransform {

  constructor(private readonly useUTC: boolean = false) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return formatDdMmmYyyy(value, this.useUTC);
    } catch {
      throw new BadRequestException('Invalid date format. Expected ISO or dd-MM-yyyy / dd/MM/yyyy / dd-MMM-yyyy.');
    }
  }
}

const MMM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const;

export function parseToDate(input: unknown): Date | null {
  if (input instanceof Date && !isNaN(+input)) return input;

  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(+d) ? null : d;
  }

  if (typeof input !== 'string') return null;
  const raw = input.trim();
  if (!raw) return null;

  // ISO or anything Date.parse can handle
  const t = Date.parse(raw);
  if (!Number.isNaN(t)) return new Date(t);

  // dd-MM-yyyy or dd/MM/yyyy
  let m = /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/.exec(raw);
  if (m) {
    const [, d, mo, y] = m;
    const year = +y.length === 2 ? +`20${y}` : +y; // naive 2-digit year handling
    const date = new Date(year, +mo - 1, +d);
    return date.getFullYear() === year && date.getMonth() === +mo - 1 && date.getDate() === +d ? date : null;
  }

  // dd-MMM-yyyy
  m = /^(\d{1,2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})$/i.exec(raw);
  if (m) {
    const [, d, mon, y] = m;
    const monthIdx = MMM.findIndex(x => x.toLowerCase() === mon.toLowerCase());
    const date = new Date(+y, monthIdx, +d);
    return date.getFullYear() === +y && date.getMonth() === monthIdx && date.getDate() === +d ? date : null;
  }

  return null;
}

export function formatDdMmmYyyy(input: unknown, useUTC = false): string {
  const date = parseToDate(input);
  if (!date) throw new Error('Invalid date');

  const day = (useUTC ? date.getUTCDate() : date.getDate()).toString().padStart(2, '0');
  const month = MMM[useUTC ? date.getUTCMonth() : date.getMonth()];
  const year = (useUTC ? date.getUTCFullYear() : date.getFullYear()).toString();

  return `${day}-${month}-${year}`;
}
