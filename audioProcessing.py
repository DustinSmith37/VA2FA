#Dustin Smith
#Audio File Pre-Processor for AI training dataset
#Primary resource for creation: https://towardsdatascience.com/how-to-build-a-neural-network-for-voice-classification-5e2810fe1efa


import os as os
import pandas as pd
import numpy as np


def audioProcessingFromDirectory(verbose=False, filePath: str = "./DefaultUsers"):
    if verbose: print("Processing")
    #grab files from directory, later will need to pull from somewhere else
    fileList = os.listdir(filePath)
    #print(fileList) 
    #load into pandas data frame data structure
    dataframe = pd.DataFrame(fileList)
    # Renaming the column name to file
    dataframe = dataframe.rename(columns={0:'file'})

    # We create an empty list where we will append all the speakers ids for each row of our dataframe by slicing the file name since we know the id is the first number before the hash
    speaker = []
    for i in range(len(dataframe)):
        speaker.append(dataframe['file'][i].split('-')[0])

    #We now assign the speaker to a new column 
    dataframe['speaker'] = speaker
    if verbose: print("Extracting")
    #Now we process the data in the dataframe with the extract features function
    dataframeProcessed = dataframe.apply(extractFeatures, directory=filePath, axis=1)
    if verbose: print("Slicing")
    dataProcessedList = []
    for i in range(len(dataframeProcessed)):
        dataProcessedList.append(np.concatenate(dataframeProcessed[i]))
    
    dataProcessedArray = np.array(dataProcessedList)
    dataNameArray = np.array(dataframe['speaker'])
    
    if verbose: print("Audio processing for directory "+filePath+" completed.")
    return dataframeProcessed, dataProcessedArray, dataNameArray

def extractFeatures(dataframe, directory):
    import librosa as librosa
    import numpy as np
    # Sets the name to be the path to where the individual file is
    fileName = directory +'/'+str(dataframe.file)
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
    return mfccs, chroma, mel, contrast, tonnetz

def userDataPreProcessing(verbose: bool = False, filePath: str = "./DefaultUsers", saveFile: str = "defaultUserData.npz"):
    if verbose: print("Processing Training Data")
    trainDataframe, trainDataArray, trainNameArray = audioProcessingFromDirectory(verbose,filePath+"/Train")
    if verbose: print("Processing Validation Data")
    validDataframe, validDataArray, validNameArray = audioProcessingFromDirectory(verbose,filePath+"/Validate")
    if verbose: print("Processing Testing Data")
    testDataframe, testDataArray, testNameArray = audioProcessingFromDirectory(verbose,filePath+"/Test")

    if verbose: print("Saving Arrays To File")
    np.savez(saveFile,trainDataArray=trainDataArray,\
    validDataArray=validDataArray,testDataArray=testDataArray,\
    trainNameArray=trainNameArray,validNameArray=validNameArray)

    if verbose: print("Save Complete, Exiting Pre-Processing")

def trainVoiceAI(verbose: bool = False, dataFile: str = "defaultUserData.npz"):
    if verbose: print("Importing Data Set")
    loadedData = np.load(dataFile)
    print(len(loadedData["trainDataArray"]),len(loadedData["validDataArray"]),\
          len(loadedData["trainNameArray"]),len(loadedData["validNameArray"]))

    if verbose: print("Importing Libraries")
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    from keras.src.utils.np_utils import to_categorical
    from keras.models import Sequential
    from keras.layers import Dense, Dropout  #, Activation, Flatten
    from keras.callbacks import EarlyStopping
    import matplotlib.pyplot as plt

    if verbose: print("Encoding and Scaling Arrays")
    # Hot encoding names
    lb = LabelEncoder()
    loadedData["trainNameArray"] = to_categorical(lb.fit_transform(loadedData["trainNameArray"]))
    loadedData["validNameArray"] = to_categorical(lb.fit_transform(loadedData["validNameArray"]))
    # Scale data arrays
    ss = StandardScaler()
    loadedData["trainDataArray"] = ss.fit_transform(loadedData["trainDataArray"])
    loadedData["validDataArray"] = ss.transform(loadedData["validDataArray"])
    loadedData["testDataArray"] = ss.transform(loadedData["testDataArray"])


    # Now train the AI
    if verbose: print("Importing Complete, Beginning Setup")
    # Build a simple dense model with early stopping and softmax for categorical classification, remember we have 30 classes
    model = Sequential()
    model.add(Dense(193, input_shape=(193,), activation = 'relu'))
    model.add(Dropout(0.1))
    model.add(Dense(128, activation = 'relu'))
    model.add(Dropout(0.25))
    model.add(Dense(128, activation = 'relu'))
    model.add(Dropout(0.5))
    model.add(Dense(30, activation = 'softmax'))
    model.compile(loss='categorical_crossentropy', metrics=['accuracy'], optimizer='adam')
    early_stop = EarlyStopping(monitor='val_loss', min_delta=0, patience=100, verbose=1, mode='auto')

    model.summary()
    if verbose: print("Settings Saved, Launching Training")

    history = model.fit(loadedData["trainDataArray"], loadedData["trainNameArray"], batch_size=256, epochs=100, validation_data=(loadedData["validDataArray"], loadedData["validNameArray"]), callbacks=[early_stop])

    if verbose: print("Training Complete, Launching Results")

    # Check out our train accuracy and validation accuracy over epochs.
    train_accuracy = history.history['accuracy']
    val_accuracy = history.history['val_accuracy']
    # Set figure size.
    plt.figure(figsize=(12, 8))
    # Generate line plot of training, testing loss over epochs.
    plt.plot(train_accuracy, label='Training Accuracy', color='#185fad')
    plt.plot(val_accuracy, label='Validation Accuracy', color='orange')
    # Set title
    plt.title('Training and Validation Accuracy by Epoch', fontsize = 25)
    plt.xlabel('Epoch', fontsize = 18)
    plt.ylabel('Categorical Crossentropy', fontsize = 18)
    plt.xticks(range(0,100,5), range(0,100,5))
    plt.legend(fontsize = 18)


def main(verbose: bool = False, skipProcessing: bool = True, filePath: str = "./DefaultUsers", dataFile: str = "defaultUserData.npz"):
    if verbose: print("Main Code Beginning!")

    if skipProcessing == False:
        if verbose: print("Starting Data Processing")
        userDataPreProcessing(verbose=verbose, filePath=filePath, saveFile=dataFile)
    
    if verbose: print("Starting Training Function")
    trainVoiceAI(verbose=verbose,dataFile=dataFile)
    
    if verbose: print("Code Complete!")

if __name__ == "__main__":
    main(verbose=True,skipProcessing=True,filePath="./DefaultUsers", dataFile = "defaultUserData.npz")