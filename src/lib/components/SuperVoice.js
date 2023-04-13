import React, { createRef } from 'react';
// import PropTypes from 'prop-types';
/* 
Main supervoice class.
*/
const api = "http://localhost:3001/v1"

class SuperVoice extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isRecording: false,
			file: null, // holds the most recent audio file
			command: '',
			configs: {

			}
		}
		this.recorder = ""
	}

	startRef = createRef();
	stopRef = createRef();

	componentDidMount() {
		this.init()
	}

	init = async () => {
		try {
			const res = await fetch(`${api}/embed/config?apiKey=${this.props.apiKey}`)
			const data = await res.json()
			console.log("data:", data)
			if (data?.configs) this.setState({ configs: data.configs })
		} catch (e) {
			console.log("e:", e)
		}
	}

	start = () => {
		console.log('start');
		const that = this
		navigator.mediaDevices.getUserMedia({
			audio: true
		})
			.then(function (stream) {
				that.setState({ isRecording: true })
				that.recorder = new MediaRecorder(stream);
				console.log("that.recorder:", that.recorder)

				// listen to dataavailable, which gets triggered whenever we have
				// an audio blob available
				that.recorder.addEventListener('dataavailable', that.onRecordingReady);
				that.recorder.start()
			});
	}

	onRecordingReady = (e) => {
		const audio = document.getElementById('audio');
		// e.data contains a blob representing the recording
		audio.src = URL.createObjectURL(e.data);
		console.log("audio.src:", audio.src)
		const file = new File([e.data], "audio");
		console.log("file:", file)
		this.setState({ file })
		audio.play();
	}

	stop = async () => {
		const { configs } = this.state

		this.recorder.stop()
		this.setState({ isRecording: false })
		// send file to configs.ai_api
		const urlRes = await fetch(`${api}/embed/presignedurl?apiKey=${this.props.apiKey}`)
		const { presigned, signed, name } = await urlRes.json()
		console.log("urlRes:", urlRes)
		await fetch(presigned, { method: "PUT", body: this.state.file });
		console.log("post to ", `${configs.ai_api}/transcribe`, ' wieth', { url: signed, name })

		// get audio transcription
		const txRes = await fetch(`${configs.ai_api}/transcribe`, {
			headers: {
				"Content-Type": "application/json",
			},
			method: "post",
			body: JSON.stringify({ url: signed, name, apiKey: this.props.apiKey })
		})
		console.log("txRes:", txRes)
		const txData = await txRes.json()
		console.log("txData:", txData)
		this.setState({ command: txData.transcript, values: txData.values, schema: txData.schema })
		this.props.onResponse(txData)
	}

	render() {
		const { containerStyle } = this.props
		const { isRecording, command, values, schema } = this.state;
		return (
			<div style={{ ...containerStyle }}>
				{!isRecording && (
					<button
						type="button"
						ref={this.startRef}
						onClick={this.start}
						className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Start
					</button>
				)}
				{isRecording && (
					<button
						type="button"
						ref={this.stopRef}
						onClick={this.stop}
						className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Stop
					</button>
				)}
				<audio id="audio" controls=""></audio>
				{false && command && (
					<p>
						command:{command}
					</p>
				)}

				{false && values && (
					<p>
						values:{JSON.stringify(values, null, 2)}
					</p>
				)}
				{false && schema && (
					<p>
						schema:{JSON.stringify(schema, null, 2)}
					</p>
				)}
			</div>
		)
	}
}


// SuperVoice.propTypes = {
// 	apiKey: PropTypes.string.isRequired,
// 	onResponse: PropTypes.func.isRequired,
// 	containerStyle: PropTypes.object,
// }

export default SuperVoice;