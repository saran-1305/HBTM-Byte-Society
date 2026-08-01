// Everything the app knows about this user lives in one localStorage key —
// export is just reading it back out as a file.
export const exportUserData = () => {
  const raw = localStorage.getItem('onboarding_state');
  const data = raw ? JSON.parse(raw) : {};
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'daskalos-data.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
