def extractFeaturesIndividualFile(fileName):
    import librosa as librosa
    import numpy as np
    # Loads the audio file as a floating point time series and assigns the default sample rate
    # Sample rate is set to 22050 by default
    X, sample_rate = librosa.load(fileName, res_type='kaiser_fast')
    # Generate Mel-frequency cepstral coefficients (MFCCs) from a time series 
    mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=40).T,axis=0)
    # Generates a Short-time Fourier transform (STFT) to use in the chroma_stft
    stft = np.abs(librosa.stft(X))
    # Computes a chromagram from a waveform or power spectrogram.
    chroma = np.mean(librosa.feature.chroma_stft(S=stft, sr=sample_rate).T,axis=0)
    # Computes a mel-scaled spectrogram
    mel = np.mean(librosa.feature.melspectrogram(y=X, sr=sample_rate).T,axis=0)
    # Computes spectral contrast
    contrast = np.mean(librosa.feature.spectral_contrast(S=stft, sr=sample_rate).T,axis=0)
    # Computes the tonal centroid features (tonnetz)
    tonnetz = np.mean(librosa.feature.tonnetz(y=librosa.effects.harmonic(X), sr=sample_rate).T,axis=0)
    return np.concatenate([mfccs, chroma, mel, contrast, tonnetz])

def testData(verbose: bool = False, userID: str = "0"):
    if verbose: print("Importing Libraries")
    from silence_tensorflow import silence_tensorflow
    silence_tensorflow() #disable tensorflow warnings
    from keras.models import load_model
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    import numpy as np

    if verbose: print("Importing Model")
    model = load_model("./uploads/"+userID+"/"+userID+"TestingModel.keras")

    if verbose: print("Importing Data Set")
    defaultUserDataMerged = np.load("./uploads/"+userID+"/"+userID+"FullData.npz", allow_pickle=True)
    fileToTestData = extractFeaturesIndividualFile("./uploads/"+userID+"/FILE_TO_BE_USED.flac")
    fileToTestData = fileToTestData.reshape(1,-1)
    #stitch these together
    testNameArray = np.append(defaultUserDataMerged["testNameArray"], userID)
    testDataArray = np.append(defaultUserDataMerged["testDataArray"],fileToTestData,axis=0)


    #testNameArray = np.flip(testNameArray)
    #testDataArray = np.flip(testDataArray)
    if verbose: print("Encoding and Scaling Arrays")
    
    #NOTE: THIS PORTION TAKES A WHILE TO IMPORT AND PERFORM, 
    #INVESTIGATE SAVING THE TRANSFORMED DATA FOR LATER AS ITS OWN FILE?
    lb = LabelEncoder()
    lb.fit_transform(testNameArray) #MUST BE TRAIN NAME ARRAY OR VALID NAME ARRAY
    # Scale data arrays
    ss = StandardScaler()
    testDataArray = ss.fit_transform(testDataArray)
    # We get our predictions from the test data
    if verbose: print("Predicting...")
    predictions=model.predict(testDataArray)
    predictedUsers=lb.inverse_transform(np.argmax(predictions,axis=1))
    if verbose: print(predictedUsers)
    print(testNameArray)
    
    #binary output for sign in, print 1 for pass, print 0 for fail, grabbing the final data point which is our latest test file
    if (predictedUsers[-1]==userID):
        print(1)
    else:
        print(0)

if __name__ == "__main__":
    testData(userID = "dus595", verbose = True)