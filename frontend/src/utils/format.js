export function getId(item) {
  return item?._id || item?.id || '';
}

export function formatDate(value, withTime = false) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  if (!withTime) {
    return `${day}/${month}/${year}`;
  }

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function mapRegisterStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'approved') return { label: 'Đã duyệt', tone: 'ok' };
  if (normalized === 'rejected') return { label: 'Từ chối', tone: 'danger' };
  if (normalized === 'cancelled') return { label: 'Đã hủy', tone: 'warn' };
  return { label: 'Chờ duyệt', tone: 'pending' };
}

export function mapProgramPhase(program) {
  const date = program?.date ? new Date(program.date) : null;
  if (!date || Number.isNaN(date.getTime())) return 'upcoming';
  const now = Date.now();
  if (date.getTime() > now) return 'upcoming';
  return 'ended';
}

export function isProgramRegistrationOpen(program, now = Date.now()) {
  if (!program?.registrationDeadline) return true;
  const deadline = new Date(program.registrationDeadline);
  if (Number.isNaN(deadline.getTime())) return true;
  return deadline.getTime() >= now;
}

