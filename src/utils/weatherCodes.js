import {
  WiDaySunny,
  WiDayCloudy,
  WiCloudy,
  WiFog,
  WiSprinkle,
  WiRain,
  WiShowers,
  WiSnow,
  WiThunderstorm,
} from 'react-icons/wi';

// Коды погоды WMO -> подпись и иконка
export function getWeatherInfo(code) {
  if (code === 0) return { label: 'Ясно', Icon: WiDaySunny };
  if (code <= 2) return { label: 'Мінлива хмарність', Icon: WiDayCloudy };
  if (code === 3) return { label: 'Хмарно', Icon: WiCloudy };
  if (code <= 48) return { label: 'Туман', Icon: WiFog };
  if (code <= 57) return { label: 'Мряка', Icon: WiSprinkle };
  if (code <= 67) return { label: 'Дощ', Icon: WiRain };
  if (code <= 77) return { label: 'Сніг', Icon: WiSnow };
  if (code <= 82) return { label: 'Злива', Icon: WiShowers };
  if (code <= 86) return { label: 'Снігопад', Icon: WiSnow };
  return { label: 'Гроза', Icon: WiThunderstorm };
}
