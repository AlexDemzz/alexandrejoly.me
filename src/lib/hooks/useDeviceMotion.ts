"use client";
import { useEffect, useRef, useState } from "react";

type GyroAcceleration = {
  x: number | null;
  y: number | null;
  speed: number;
  verticalSpeed: number;
  horizontalSpeed: number;
  verticalDirection: number;
  horizontalDirection: number;
  acceleration: number;
  verticalAcceleration: number;
  horizontalAcceleration: number;
};

const useDeviceMotion = (): GyroAcceleration => {
  const [gyroMetrics, setGyroMetrics] = useState<GyroAcceleration>({
    x: 0,
    y: 0,
    speed: 0,
    verticalSpeed: 0,
    horizontalSpeed: 0,
    verticalDirection: 0,
    horizontalDirection: 0,
    acceleration: 0,
    verticalAcceleration: 0,
    horizontalAcceleration: 0,
  });

  const gyroRef = useRef<{
    prevSpeed: number;
    prevVerticalSpeed: number;
    prevHorizontalSpeed: number;
    prevEvent: DeviceMotionEvent | null;
    currentEvent: DeviceMotionEvent | null;
  }>({
    prevSpeed: 0,
    prevVerticalSpeed: 0,
    prevHorizontalSpeed: 0,
    prevEvent: null,
    currentEvent: null,
  });

  const rafRef = useRef<number>(0);
  const lastSpeedCalculation = useRef<number>(0);
  const prevRafTimestamp = useRef<number | null>(null);
  const isCalculating = useRef<boolean>(false);

  const calculateGyroMetrics = (timestamp: number): void => {
    if (timestamp - lastSpeedCalculation.current < 100) {
      return;
    }

    lastSpeedCalculation.current = timestamp;

    if (
      !gyroRef.current.currentEvent ||
      !gyroRef.current.prevEvent ||
      !gyroRef.current.currentEvent.rotationRate ||
      !gyroRef.current.prevEvent.rotationRate
    ) {
      gyroRef.current.prevEvent = gyroRef.current.currentEvent;
      return;
    }

    const offsetX =
      (gyroRef.current.currentEvent.rotationRate.alpha || 0) -
      (gyroRef.current.prevEvent.rotationRate.alpha || 0);
    const offsetY =
      (gyroRef.current.currentEvent.rotationRate.beta || 0) -
      (gyroRef.current.prevEvent.rotationRate.beta || 0);
    const movementX = Math.abs(offsetX);
    const movementY = Math.abs(offsetY);
    const movement = Math.sqrt(movementX * movementX + movementY * movementY);

    const metrics: GyroAcceleration = {
      x: gyroRef.current.currentEvent.rotationRate.alpha,
      y: gyroRef.current.currentEvent.rotationRate.beta,
      speed: 10 * movement,
      verticalSpeed: 10 * movementY,
      horizontalSpeed: 10 * movementX,
      verticalDirection: Math.sign(offsetY),
      horizontalDirection: Math.sign(offsetX),
      acceleration: 10 * (10 * movement - gyroRef.current.prevSpeed),
      verticalAcceleration:
        10 * (10 * movementY - gyroRef.current.prevVerticalSpeed),
      horizontalAcceleration:
        10 * (10 * movementX - gyroRef.current.prevHorizontalSpeed),
    };

    setGyroMetrics(Object.assign({}, metrics));

    gyroRef.current.prevSpeed = metrics.speed;
    gyroRef.current.prevVerticalSpeed = metrics.verticalSpeed;
    gyroRef.current.prevHorizontalSpeed = metrics.horizontalSpeed;
    gyroRef.current.prevEvent = gyroRef.current.currentEvent;
  };

  useEffect(() => {
    const setGyroCurrentEvent = (e: DeviceMotionEvent): void => {
      gyroRef.current.currentEvent = e;
    };

    const startGyroCalculation = (): void => {
      if (isCalculating.current) {
        return;
      }

      isCalculating.current = true;

      const step = (timestamp: number): void => {
        if (!isCalculating.current) {
          return;
        }

        if (!prevRafTimestamp.current) {
          prevRafTimestamp.current = timestamp;
        }

        prevRafTimestamp.current = timestamp;

        calculateGyroMetrics(timestamp);
        rafRef.current = requestAnimationFrame(step);
      };

      rafRef.current = requestAnimationFrame(step);
    };

    const handleDeviceMotion = (e: DeviceMotionEvent): void => {
      setGyroCurrentEvent(e);
      startGyroCalculation();
    };

    window.addEventListener("devicemotion", handleDeviceMotion);

    return () => {
      window.removeEventListener("devicemotion", handleDeviceMotion);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return gyroMetrics;
};

export default useDeviceMotion;
