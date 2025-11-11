import { useAuthenticator } from '@aws-amplify/ui-react';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import Dashboard from "./components/Dashboard";

function App() {
  const { signOut } = useAuthenticator();

  return (
    <main>
      <Dashboard />
      
      {/* File Uploader Section - You can move this into Dashboard or a separate component if needed */}
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h2>Upload Images</h2>
        <FileUploader
          acceptedFileTypes={['image/*']}
          path="image-submissions/"
          maxFileCount={1}
          isResumable
        />
        <footer style={{ marginTop: '1rem' }}>
          Upload a file above.
        </footer>
      </div>

      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <button onClick={signOut}>Sign out</button>
      </div>
    </main>
  );
}

export default App;