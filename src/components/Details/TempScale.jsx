import PropTypes from 'prop-types';
import styles from './Details.module.css';

export default function TempScale({ temp, min, max }) {
  const range = max - min || 1;
  const percent = Math.min(100, Math.max(0, ((temp - min) / range) * 100));

  return (
    <div className={styles.scale}>
      <div className={styles.scaleBar}>
        <div className={styles.scaleMarker} style={{ left: `${percent}%` }}>
          {temp}°
        </div>
      </div>
      <div className={styles.scaleLabels}>
        <span>{min}°</span>
        <span>{max}°</span>
      </div>
    </div>
  );
}

TempScale.propTypes = {
  temp: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
};
