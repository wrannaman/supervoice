import SuperVoice from './lib/components/SuperVoice';
const API_KEY = process.env.API_KEY;
console.log('process', process.env.API_KEY);

function App() {
  return (
    <div>
      <div>
        Hi This is my app where I include super voie
        <div>
          <SuperVoice
            apiKey={API_KEY}
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
