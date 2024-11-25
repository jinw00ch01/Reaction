export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };
  
  return new Intl.DateTimeFormat('ko-KR', options).format(date);
}; 