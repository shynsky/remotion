import React, {useEffect, useRef, useState} from 'react';
import {FEATURE_FLAG_V2_BREAKING_CHANGES} from '../feature-flags';
import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {usePlayingState} from '../timeline-position-state';
import {useAbsoluteCurrentFrame, useCurrentFrame} from '../use-frame';
import {useUnsafeVideoConfig} from '../use-unsafe-video-config';
import {evaluateVolume} from '../volume-prop';
import {getCurrentTime} from './get-current-time';
import {RemotionVideoProps} from './props';

export const VideoForDevelopment: React.FC<RemotionVideoProps> = (props) => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const currentFrame = useCurrentFrame();
	const absoluteFrame = useAbsoluteCurrentFrame();
	const videoConfig = useUnsafeVideoConfig();
	const [playing] = usePlayingState();
	const [actualVolume, setActualVolume] = useState(1);

	const {volume, ...nativeProps} = props;

	// TODO: Register as an asset
	useEffect(() => {
		if (playing && !videoRef.current?.ended) {
			videoRef.current?.play();
		} else {
			videoRef.current?.pause();
		}
	}, [playing]);

	useEffect(() => {
		const ref = videoRef.current;
		if (!ref) {
			return;
		}
		if (ref.volume !== actualVolume) {
			setActualVolume(ref.volume);
			return;
		}
		const onChange = () => {
			setActualVolume(ref.volume);
		};
		ref.addEventListener('volumechange', onChange);
		return () => ref.removeEventListener('volumechange', onChange);
	}, [actualVolume]);

	useEffect(() => {
		const userPreferredVolume = evaluateVolume({
			frame: currentFrame,
			volume,
		});
		if (
			!isApproximatelyTheSame(userPreferredVolume, actualVolume) &&
			videoRef.current
		) {
			videoRef.current.volume = userPreferredVolume;
		}
	}, [actualVolume, currentFrame, props.volume, volume]);

	useEffect(() => {
		if (!videoRef.current) {
			throw new Error('No video ref found');
		}

		if (!videoConfig) {
			throw new Error(
				'No video config found. <Video> must be placed inside a composition.'
			);
		}
		const currentTime = (() => {
			if (FEATURE_FLAG_V2_BREAKING_CHANGES) {
				return getCurrentTime({
					fps: videoConfig.fps,
					frame: currentFrame,
					src: props.src as string,
				});
			}
			return currentFrame / (1000 / videoConfig.fps);
		})();

		if (!playing || absoluteFrame === 0) {
			videoRef.current.currentTime = currentTime;
		}

		if (videoRef.current.paused && !videoRef.current.ended && playing) {
			videoRef.current.currentTime = currentTime;
			videoRef.current.play();
		}
	}, [currentFrame, playing, videoConfig, absoluteFrame, props.src]);

	return <video ref={videoRef} {...nativeProps} />;
};
