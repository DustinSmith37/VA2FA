#Dustin Smith
#Audio File Pre-Processor for AI training dataset
#Primary resource for creation: https://towardsdatascience.com/how-to-build-a-neural-network-for-voice-classification-5e2810fe1efa

import os as os
import pandas as pd
import numpy as np
import librosa as librosa
from sklearn.preprocessing import LabelEncoder, StandardScaler
from keras.src.utils.np_utils import to_categorical
#import matplotlib.pyplot as plt

def pullDefaultUsersData(filePath: str = "./DefaultUsers"):
    #grab files from directory, later will need to pull from somewhere else
    #print(filePath)
    fileList = os.listdir(filePath+"/Train")
    #print(fileList) 
    #load into pandas data frame data structure
    trainDefaultUsers = pd.DataFrame(fileList)
    # Renaming the column name to file
    trainDefaultUsers = trainDefaultUsers.rename(columns={0:'file'})
    # We create an empty list where we will append all the speakers ids for each row of our dataframe by slicing the file name since we know the id is the first number before the hash
    speaker = []
    for i in range(len(trainDefaultUsers)):
        speaker.append(trainDefaultUsers['file'][i].split('-')[0])
    # We now assign the speaker to a new column 
    trainDefaultUsers['speaker'] = speaker
    # print(trainDefaultUsers.head())

    #repeat for validating and testing data
    fileList = os.listdir(filePath+"/Validate")
    validDefaultUsers = pd.DataFrame(fileList)
    validDefaultUsers = validDefaultUsers.rename(columns={0:'file'})
    speaker = []
    for i in range(len(validDefaultUsers)):
        speaker.append(validDefaultUsers['file'][i].split('-')[0])
    validDefaultUsers['speaker'] = speaker
    # print(validDefaultUsers.head())

    fileList = os.listdir(filePath+"/Test")
    testDefaultUsers = pd.DataFrame(fileList)
    testDefaultUsers = testDefaultUsers.rename(columns={0:'file'})
    speaker = []
    for i in range(len(testDefaultUsers)):
        speaker.append(testDefaultUsers['file'][i].split('-')[0])
    testDefaultUsers['speaker'] = speaker
    # print(testDefaultUsers.head())

    return trainDefaultUsers,validDefaultUsers,testDefaultUsers

def extractFeaturesTrain(dataframe, directory):
    # Sets the name to be the path to where the individual file is
    fileName = "./DefaultUsers/" + directory +'/'+str(dataframe.file)
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

def main():
    print("Main Code Beginning!")

    trainDF,validDF,testDF = pullDefaultUsersData()

    print("Default User Data Retrieved")

    trainFeaturesProcessed = trainDF.apply(extractFeaturesTrain, directory="Train", axis=1)
    validFeaturesProcessed = validDF.apply(extractFeaturesTrain, directory="Validate", axis=1)
    testFeaturesProcessed = testDF.apply(extractFeaturesTrain, directory="Test", axis=1)

    print("Features Processed")
    
    trainFeaturesList = []
    for i in range(0, len(trainFeaturesProcessed)):
        trainFeaturesList.append(np.concatenate((
            trainFeaturesProcessed[i][0],
            trainFeaturesProcessed[i][1], 
            trainFeaturesProcessed[i][2], 
            trainFeaturesProcessed[i][3],
            trainFeaturesProcessed[i][4]), axis=0))
    
    validFeaturesList = []
    for i in range(0, len(validFeaturesProcessed)):
        validFeaturesList.append(np.concatenate((
            validFeaturesProcessed[i][0],
            validFeaturesProcessed[i][1], 
            validFeaturesProcessed[i][2], 
            validFeaturesProcessed[i][3],
            validFeaturesProcessed[i][4]), axis=0))
        
    testFeaturesList = []
    for i in range(0, len(testFeaturesProcessed)):
        testFeaturesList.append(np.concatenate((
            testFeaturesProcessed[i][0],
            testFeaturesProcessed[i][1], 
            testFeaturesProcessed[i][2], 
            testFeaturesProcessed[i][3],
            testFeaturesProcessed[i][4]), axis=0))

    #create data and names arrays
    trainDataArray = np.array(trainFeaturesList)
    validDataArray = np.array(validFeaturesList)
    testDataArray = np.array(testFeaturesList)
    trainNameArray = np.array(trainDF['speaker'])
    validNameArray = np.array(validDF['speaker'])

    # Hot encoding names
    lb = LabelEncoder()
    trainNameArray = to_categorical(lb.fit_transform(trainNameArray))
    validNameArray = to_categorical(lb.fit_transform(validNameArray))
    # Scale data arrays
    ss = StandardScaler()
    trainDataArray = ss.fit_transform(trainDataArray)
    validDataArray = ss.transform(validDataArray)
    testDataArray = ss.transform(testDataArray)

    print("Arrays created and data scaled, AI setup beginning")

    print("Attempting a save and load first to check results")

    np.savez("defaultUserData.npz",trainDataArray=trainDataArray,\
    validDataArray=validDataArray,testDataArray=testDataArray,\
    trainNameArray=trainNameArray,validNameArray=validNameArray)

    print("Saved successfully, loading")

    loadedData = np.load("defaultUserData.npz")

    print("Loaded successfully, comparing training data array")

    print(trainDataArray)
    print(loadedData["trainDataArray"])

    #FROM HERE AND BELOW, WE ARE TRAINING THE AI. THIS IS ERRORING OUT, BUT HEY, WE SAVED THOSE WEIGHTS.

    # Now train the AI
    from keras.models import Sequential
    from keras.layers import Dense, Dropout, Activation, Flatten
    from keras.callbacks import EarlyStopping
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

    print("Settings saved, launching training")

    history = model.fit(trainDataArray, trainNameArray, batch_size=256, epochs=100, validation_data=(validDataArray, validNameArray), callbacks=[early_stop])

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



if __name__ == "__main__":
    main()