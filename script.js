document.getElementById('enterBtn').addEventListener('click', () => {
  document.querySelector('.welcome').classList.add('hidden');
  document.querySelector('.content').classList.remove('hidden');
});
document.getElementById('backBtn').addEventListener('click', () => {
  document.querySelector('.content').classList.add('hidden');
  document.querySelector('.welcome').classList.remove('hidden');
});