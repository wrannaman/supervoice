import SuperVoice from './lib/components/SuperVoice';
import config from './config.json'

function App() {
  return (
    <div>
      <div>
        Hi This is my app where I include super voie
        <div>
          <SuperVoice
            apiKey={config.API_KEY}
            containerStyle={{}}
            position={"bottom-right"}
            onResponse={(e) => {
              console.log('got response', e);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
