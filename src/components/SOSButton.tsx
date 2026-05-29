import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ShieldAlert } from 'lucide-react-native';

interface SOSButtonProps {
  onActivate?: () => void;
  size?: number;
}

export const SOSButton = ({ onActivate, size = 180 }: SOSButtonProps) => {
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);
  const interval = useRef<any>(null);

  const radius = 75, strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const start = () => {
    if (active) return;
    interval.current = setInterval(() => {
      setProgress(prev => {
        if (prev + 1.8 >= 100) {
          clearInterval(interval.current);
          setActive(true);
          onActivate?.();
          return 100;
        }
        return prev + 1.8;
      });
    }, 54);
  };

  const end = () => {
    if (active) return;
    clearInterval(interval.current);
    setProgress(0);
  };

  const cancel = () => { setActive(false); setProgress(0); };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(239,68,68,0.25)" strokeWidth={strokeWidth} fill="none" />
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#EF4444" strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      </Svg>
      <Pressable onPressIn={start} onPressOut={end} style={styles.inner}>
        <ShieldAlert size={38} color="#FFF" />
        <Text style={styles.text}>{active ? 'ACTIVE' : progress > 0 ? `${Math.round(progress)}%` : 'SOS'}</Text>
      </Pressable>
      {active && (
        <Pressable onPress={cancel} style={styles.cancel}>
          <Text style={{ color: '#EF4444', fontWeight: '700' }}>Cancel</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center' },
  inner: {
    width: 140, height: 140, borderRadius: 70, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center',
    shadowColor: 'rgba(239,68,68,0.6)', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 36, elevation: 12,
  },
  text: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 3, marginTop: 4 },
  cancel: { marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12, borderWidth: 1.5, borderColor: '#EF4444' },
});
