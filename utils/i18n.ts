
import { Language } from '../types';

type Dictionary = Record<string, { ru: string; en: string }>;

const translations: Dictionary = {
  // General
  back: { ru: 'Назад', en: 'Back' },
  settings: { ru: 'Настройки', en: 'Settings' },
  home: { ru: 'Главная', en: 'Home' },
  
  // Dashboard Sidebar & Header
  myProjects: { ru: 'Мои проекты', en: 'My Projects' },
  templates: { ru: 'Шаблоны', en: 'Templates' },
  trash: { ru: 'Корзина', en: 'Recycle Bin' },
  searchPlaceholder: { ru: 'Найти шаблон или проект', en: 'Search template or project' },
  logout: { ru: 'Выйти', en: 'Logout' },

  // Dashboard Main
  welcomeBack: { ru: 'С возвращением,', en: 'Welcome back,' },
  newProject: { ru: 'Новый проект', en: 'New Project' },
  createVideo: { ru: 'Создать видео', en: 'Create Video' },
  startFromScratch: { ru: 'Начать с нуля', en: 'Start from scratch' },
  screenRec: { ru: 'Запись экрана', en: 'Screen Rec' },
  cameraScreen: { ru: 'Камера, экран', en: 'Camera, screen' },
  
  // Trash
  trashTitle: { ru: 'Корзина', en: 'Recycle Bin' },
  trashDesc: { ru: 'Здесь хранятся удаленные проекты. Вы можете восстановить их или удалить навсегда.', en: 'Deleted projects are stored here. You can restore them or permanently delete them.' },
  emptyTrash: { ru: 'Очистить корзину', en: 'Empty Trash' },
  trashEmpty: { ru: 'Корзина пуста', en: 'Recycle Bin is empty' },
  deletedProjects: { ru: 'Удаленные проекты', en: 'Deleted Projects' },
  yourVideos: { ru: 'Ваши видео', en: 'Your Videos' },
  noProjects: { ru: 'У вас пока нет проектов', en: 'You have no projects yet' },
  createFirst: { ru: 'Создать первый проект', en: 'Create first project' },

  // Dialogs
  createProject: { ru: 'Создать новое видео', en: 'Create New Video' },
  projectName: { ru: 'Название проекта', en: 'Project Name' },
  aspectRatio: { ru: 'Формат', en: 'Aspect Ratio' },
  cancel: { ru: 'Отмена', en: 'Cancel' },
  create: { ru: 'Создать', en: 'Create' },
  projectPlaceholder: { ru: 'Мой крутой эдит...', en: 'My awesome edit...' },
  deleteForeverConfirm: { ru: 'Это действие нельзя отменить. Удалить навсегда?', en: 'This action cannot be undone. Delete forever?' },
  emptyTrashConfirm: { ru: 'Вы уверены, что хотите удалить ВСЕ проекты из корзины? Это действие нельзя отменить.', en: 'Are you sure you want to delete ALL projects from the Recycle Bin? This action cannot be undone.' },
  projectNotFound: { ru: 'Проект не найден или поврежден', en: 'Project not found or corrupted' },

  // Export
  exportTitle: { ru: 'Экспорт видео', en: 'Export Video' },
  fileName: { ru: 'Имя файла', en: 'File Name' },
  resolution: { ru: 'Разрешение', en: 'Resolution' },
  fps: { ru: 'Частота кадров (FPS)', en: 'Frame Rate (FPS)' },
  startExport: { ru: 'Экспортировать', en: 'Export' },
  rendering: { ru: 'Рендеринг...', en: 'Rendering...' },
  renderDesc: { ru: 'Пожалуйста, не закрывайте приложение', en: 'Please do not close the application' },
  saveLocation: { ru: 'Куда сохранить?', en: 'Where to save?' },
  success: { ru: 'Готово!', en: 'Done!' },
  successDesc: { ru: 'Ваше видео успешно сохранено', en: 'Your video has been saved successfully' },

  // Settings
  profile: { ru: 'Профиль', en: 'Profile' },
  general: { ru: 'Общее', en: 'General' },
  firstName: { ru: 'Имя', en: 'First Name' },
  lastName: { ru: 'Фамилия', en: 'Last Name' },
  changeAvatar: { ru: 'Сменить аватар', en: 'Change Avatar' },
  language: { ru: 'Язык', en: 'Language' },
  theme: { ru: 'Тема оформления', en: 'Appearance Theme' },
  themeLight: { ru: 'Светлая', en: 'Light' },
  themeNeon: { ru: 'Неон (Red)', en: 'Neon (Red)' },
  themeDark: { ru: 'Тёмная', en: 'Dark' },

  // Editor
  timeline: { ru: 'Таймлайн', en: 'Timeline' },
  media: { ru: 'Мультимедиа', en: 'Media' },
  audio: { ru: 'Аудио', en: 'Audio' },
  text: { ru: 'Текст', en: 'Text' },
  properties: { ru: 'Свойства', en: 'Properties' },
  export: { ru: 'Экспортировать', en: 'Export' },
  all: { ru: 'Все', en: 'All' },
  video: { ru: 'Видео', en: 'Video' },
  photo: { ru: 'Фото', en: 'Photos' },
  noFiles: { ru: 'Нет файлов', en: 'No files' },
  importMedia: { ru: 'Импорт медиа', en: 'Import Media' },
  
  // Effects Panel
  effectsTitle: { ru: 'Эффекты', en: 'Effects' },
  dragEffect: { ru: 'Перетащите эффект на таймлайн', en: 'Drag effect to timeline' },
  
  // Effect Names & Descs
  eff_snow: { ru: 'Снег', en: 'Snow' },
  eff_snow_desc: { ru: 'Падающий снег', en: 'Falling snow' },
  eff_leaves: { ru: 'Листья', en: 'Leaves' },
  eff_leaves_desc: { ru: 'Осенние листья', en: 'Autumn leaves' },
  eff_frame: { ru: 'Рамка', en: 'Frame' },
  eff_frame_desc: { ru: 'Красивая рамка', en: 'Beautiful frame' },
  eff_sunrise: { ru: 'Рассвет', en: 'Sunrise' },
  eff_sunrise_desc: { ru: 'Из тьмы в свет', en: 'From dark to light' },
  eff_fadeout: { ru: 'Затемнение', en: 'Fade Out' },
  eff_fadeout_desc: { ru: 'Уход в тьму', en: 'Fade into darkness' },
  eff_shake: { ru: 'Тряска', en: 'Shake' },
  eff_shake_desc: { ru: 'Землетрясение', en: 'Earthquake' },
  eff_stars: { ru: 'Звезды', en: 'Stars' },
  eff_stars_desc: { ru: 'Падающие звезды', en: 'Falling stars' },
  eff_rain: { ru: 'Дождь', en: 'Rain' },
  eff_rain_desc: { ru: 'Сильный ливень', en: 'Heavy rain' },
  eff_vhs: { ru: 'VHS Глитч', en: 'VHS Glitch' },
  eff_vhs_desc: { ru: 'Эффект старой кассеты', en: 'Old tape effect' },
  eff_blur: { ru: 'Размытие', en: 'Blur' },
  eff_blur_desc: { ru: 'Расфокус', en: 'Out of focus' },
  eff_sepia: { ru: 'Сепия', en: 'Sepia' },
  eff_sepia_desc: { ru: 'Старое кино', en: 'Old movie style' },
  eff_flash: { ru: 'Вспышка', en: 'Flash' },
  eff_flash_desc: { ru: 'Пульсирующий свет', en: 'Pulsing light' },
  eff_invert: { ru: 'Инверсия', en: 'Invert' },
  eff_invert_desc: { ru: 'Негатив', en: 'Negative colors' },

  // Props
  transform: { ru: 'Трансформация', en: 'Transform' },
  scale: { ru: 'Масштаб', en: 'Scale' },
  rotation: { ru: 'Поворот', en: 'Rotation' },
  speed: { ru: 'Скорость', en: 'Speed' },
  positionX: { ru: 'Позиция X', en: 'Position X' },
  positionY: { ru: 'Позиция Y', en: 'Position Y' },
  opacity: { ru: 'Непрозрачность', en: 'Opacity' },
  mirrorH: { ru: 'Отразить горизонтально', en: 'Mirror Horizontal' },
  selectClip: { ru: 'Выберите клип на таймлайне, чтобы редактировать его!', en: 'Select a clip on the timeline to edit it!' },
  nothingSelected: { ru: 'Ничего не выбрано', en: 'Nothing selected' },
  clickToEdit: { ru: 'Нажмите на клип на таймлайне,\nчтобы настроить его.', en: 'Click on a clip on the timeline\nto edit it.' },
};

export const t = (key: string, lang: Language): string => {
  return translations[key]?.[lang] || key;
};
