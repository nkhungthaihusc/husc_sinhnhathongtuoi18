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

export function formatDateTime(value) {
  return formatDate(value, true);
}

export function formatTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function mapRegisterStatus(resultValue) {
  const normalized = String(resultValue || '').toLowerCase();
  if (normalized === 'approved' || normalized === 'success') return { label: 'Thành công', tone: 'ok' };
  if (normalized === 'rejected' || normalized === 'reject') return { label: 'Từ chối', tone: 'danger' };
  if (normalized === 'cancelled') return { label: 'Đã hủy', tone: 'warn' };
  return { label: 'Chờ duyệt', tone: 'pending' };
}

export function getStatusDisplay(statusValue, resultValue) {
  const status = String(statusValue || '').toLowerCase();
  const result = String(resultValue || '').toLowerCase();
  
  if (status === 'cancelled' || result === 'cancelled') {
    return { label: 'Đã hủy', tone: 'warn' };
  }
  
  if (status === 'approved') return { label: 'Đã duyệt', tone: 'ok' };
  if (status === 'rejected') return { label: 'Từ chối', tone: 'danger' };
  return { label: 'Chờ duyệt', tone: 'pending' };
}

export function isCancelled(statusValue, resultValue) {
  const status = String(statusValue || '').toLowerCase();
  const result = String(resultValue || '').toLowerCase();
  return status === 'cancelled' || result === 'cancelled';
}

export function getResultDisplay(resultValue, statusValue) {
  const result = String(resultValue || '').toLowerCase();
  const status = String(statusValue || '').toLowerCase();
  
  if (status === 'cancelled' || result === 'cancelled') {
    return { label: 'Đã hủy', tone: 'warn' };
  }
  
  if (status === 'approved' && result === 'pending') {
    return { label: 'Chờ kết quả', tone: 'pending' };
  }
  
  if (result === 'approved') {
    return { label: 'Thành công', tone: 'ok' };
  }
  
  if (result === 'rejected') {
    return { label: 'Từ chối', tone: 'danger' };
  }
  
  return { label: 'Chờ duyệt', tone: 'pending' };
}

export function formatUserStatus(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'active') return 'Hoạt động';
  return 'Không hoạt động';
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

export function sortProgramsByRegistrationPriority(programs, now = Date.now()) {
  const list = Array.isArray(programs) ? [...programs] : [];
  return list.sort((a, b) => {
    const aOpen = isProgramRegistrationOpen(a, now);
    const bOpen = isProgramRegistrationOpen(b, now);

    if (aOpen !== bOpen) {
      return aOpen ? -1 : 1;
    }

    const aDate = new Date(a?.date || 0).getTime();
    const bDate = new Date(b?.date || 0).getTime();
    const aDiff = Math.abs(aDate - now);
    const bDiff = Math.abs(bDate - now);
    return aDiff - bDiff;
  });
}

