import type {render} from 'react-dom';
import ReactDOM from 'react-dom/client';
// eslint-disable-next-line no-restricted-imports
import {Internals} from 'remotion';
import '../styles/styles.css';
import {Editor} from './editor/components/Editor';
import {openEventSource} from './event-source';

Internals.CSSUtils.injectCSS(
	Internals.CSSUtils.makeDefaultCSS(null, '#1f2428')
);

const content = (
	<Internals.RemotionRoot>
		<Editor />
	</Internals.RemotionRoot>
);

if (ReactDOM.createRoot) {
	ReactDOM.createRoot(Internals.getPreviewDomElement() as HTMLElement).render(
		content
	);
} else {
	(ReactDOM as unknown as {render: typeof render}).render(
		<Internals.RemotionRoot>
			<Editor />
		</Internals.RemotionRoot>,
		Internals.getPreviewDomElement()
	);
}

openEventSource();
