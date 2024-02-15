#Dustin Smith
#Audio File Pre-Processor for AI training dataset
#Primary resource for creation: https://towardsdatascience.com/how-to-build-a-neural-network-for-voice-classification-5e2810fe1efa


import os as os
import pandas as pd
import numpy as np
import sys as sys

def audioProcessingFromDirectory(verbose=False, filePath: str = "./uploads", userID: str = "0", selection: tuple = (0,0)):
    if verbose: print("Processing")
    #grab files from directory
    fileList = os.listdir(filePath+"/"+userID)
    fileList = [file for file in fileList if ".flac" in file] #drop any non flac files
    fileList = fileList[selection[0]:selection[1]] #only grab the range we are specified, to determine train/valid/test data.

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
    dataframeProcessed = dataframe.apply(extractFeatures, directory=filePath+"/"+userID, axis=1)
    if verbose: print("Slicing")
    dataProcessedList = []
    for i in range(len(dataframeProcessed)):
        dataProcessedList.append(np.concatenate(dataframeProcessed[i]))
    
    dataProcessedArray = np.array(dataProcessedList)
    dataNameArray = np.array(dataframe['speaker'])
    
    if verbose: print("Audio processing subcomponent for directory "+filePath+"/"+userID+" completed.")
    return dataProcessedArray, dataNameArray

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

def userDataPreProcessing(verbose: bool = False, filePath: str = "./uploads", userID: str = "0", saveFile: str = "UserData.npz"):
    if verbose: print("Importing Libraries")

    if verbose: print("Processing Training Data")
    trainDataArray, trainNameArray = audioProcessingFromDirectory(verbose,filePath,userID,(0,4))
    if verbose: print("Processing Validation Data")
    validDataArray, validNameArray = audioProcessingFromDirectory(verbose,filePath,userID,(4,7))
    if verbose: print("Processing Testing Data")
    testDataArray, testNameArray = audioProcessingFromDirectory(verbose,filePath,userID,(7,10))
    
    if verbose: print("Audio processing for directory "+filePath+"/"+userID+" completed.")

    if verbose: print("Saving Arrays To File")
    np.savez(filePath + "/" + userID + "/" + userID + saveFile,\
    trainDataArray=trainDataArray, trainNameArray=trainNameArray,\
    validDataArray=validDataArray, validNameArray=validNameArray,\
    testDataArray=testDataArray,   testNameArray=testNameArray)

    if verbose: print("Save Complete, Exiting Pre-Processing")

def trainVoiceAI(verbose: bool = False, numDefault: int = 30, userID: str = "0"):

    if verbose: print("Importing Data Set")
    #pulling list of all directories in default users
    defaultUserList = os.listdir("./DefaultUsers")
    #drop any npz files just in case (shouldn't be necessary)
    defaultUserList = [file for file in defaultUserList if not ".npz" in file]
    #only grab the first x defaultUsers to train with
    defaultUserList=defaultUserList[:numDefault]

    # Load them, first by making a list of the npz files
    defaultUserDataSegmented = [np.load("./DefaultUsers/"+defUserID+"/"+defUserID+"UserData.npz", allow_pickle=True) for defUserID in defaultUserList]
    defaultUserDataMerged = {}
    #then merged them together using a dictionary and the keys in the npz arrays. Will access this dictionary as needed later
    for k in defaultUserDataSegmented[0].keys():
        defaultUserDataMerged[k] = np.concatenate(list(d[k] for d in defaultUserDataSegmented))
    
    #saving to directory in the event we need it later
    np.savez('defaultUserDataMerged.npz', **defaultUserDataMerged)

    if verbose: 
        for k,v in defaultUserDataMerged.items():
            print(k,len(v))

    if verbose: print("Importing Libraries")
    from keras.models import Sequential
    from keras.layers import Dense, Dropout  #, Activation, Flatten
    from keras.callbacks import EarlyStopping
    import matplotlib.pyplot as plt
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    from keras.src.utils.np_utils import to_categorical


    if verbose: print("Encoding and Scaling Arrays")
    # Hot encoding names
    lb = LabelEncoder()
    defaultUserDataMerged["trainNameArray"] = to_categorical(lb.fit_transform(defaultUserDataMerged["trainNameArray"]))
    defaultUserDataMerged["validNameArray"] = to_categorical(lb.fit_transform(defaultUserDataMerged["validNameArray"]))
    defaultUserDataMerged["testNameArray"] = to_categorical(lb.fit_transform(defaultUserDataMerged["testNameArray"]))
    # Scale data arrays
    ss = StandardScaler()
    defaultUserDataMerged["trainDataArray"] = ss.fit_transform(defaultUserDataMerged["trainDataArray"])
    defaultUserDataMerged["validDataArray"] = ss.transform(defaultUserDataMerged["validDataArray"])
    defaultUserDataMerged["testDataArray"] = ss.transform(defaultUserDataMerged["testDataArray"])

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
    model.add(Dense(numDefault, activation = 'softmax')) #REMEMBER TO MAKE THIS numDefault + 1 in final version!!!!
    model.compile(loss='categorical_crossentropy', metrics=['accuracy'], optimizer='adam')
    early_stop = EarlyStopping(monitor='val_loss', min_delta=0, patience=100, verbose=1, mode='auto')

    if verbose: print("Model Settings As Follows:")
    if verbose: model.summary()
    if verbose: print("Settings Saved, Launching Training")

    history = model.fit(defaultUserDataMerged["trainDataArray"],defaultUserDataMerged["trainNameArray"], batch_size=256, epochs=100, validation_data=(defaultUserDataMerged["validDataArray"], defaultUserDataMerged["validNameArray"]), callbacks=[early_stop])

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
    plt.show()

    model.save("./TestingModel.keras")

def testData(verbose: bool = False, modelPath: str = "./TestingModel.keras", dataFile: str = "defaultUserDataMerged.npz"):
    if verbose: print("Importing Libraries")
    from keras.models import load_model
    from sklearn.preprocessing import LabelEncoder, StandardScaler
    
    if verbose: print("Importing Model")
    model = load_model(modelPath)

    if verbose: print("Importing Data Set")
    defaultUserDataMerged = np.load(dataFile, allow_pickle=True)

    if verbose: print("Encoding and Scaling Arrays")
    
    #NOTE: THIS PORTION TAKES A WHILE TO IMPORT AND PERFORM, 
    #INVESTIGATE SAVING THE TRANSFORMED DATA FOR LATER AS ITS OWN FILE?
    lb = LabelEncoder()
    lb.fit_transform(defaultUserDataMerged["testNameArray"]) #MUST BE TRAIN NAME ARRAY OR VALID NAME ARRAY
    # Scale data arrays
    ss = StandardScaler()
    testDataArray = ss.fit_transform(defaultUserDataMerged["testDataArray"]) #CAN BE ANY OF THE DATA ARRAYS TO FIT SUCCESSFULLY
    #in order to run on a single data point, use .reshape(1,-1) inside the fit_transform() on the data
    # [0].reshape(1,-1)
    # We get our predictions from the test data
    predictions=model.predict(testDataArray)
    predictedUsers=lb.inverse_transform(np.argmax(predictions,axis=1))
    for i in range(len(defaultUserDataMerged["testNameArray"])):
        print(predictedUsers[i],defaultUserDataMerged["testNameArray"][i],predictedUsers[i]==defaultUserDataMerged["testNameArray"][i])

def main():
    operation = sys.argv[1]
    userID = sys.argv[2]
    additionalArgs = sys.argv[3:]
    print(operation,userID,additionalArgs)
    
    verbose = "v" in additionalArgs or "verbose" in additionalArgs

    if verbose: print("Main Code Beginning!")

    if (operation == "process"):
        if verbose: print("Starting Data Processing")
        userDataPreProcessing(verbose=verbose, userID = userID)
    elif (operation == "defProcess"):
        if verbose: print("Starting Default User Data Processing")
        defaultUserList = os.listdir("./DefaultUsers")
        defaultUserList = [file for file in defaultUserList if not ".npz" in file]
        defaultUserList=defaultUserList[:int(userID)]
        for i in defaultUserList:
            if verbose: print("========================\n%s, directory %s of %s\n========================"% (i,defaultUserList.index(i)+1,len(defaultUserList)))
            userDataPreProcessing(verbose=verbose, filePath = "./DefaultUsers", userID = i)
    elif (operation == "train"):
        if verbose: print("Starting Training Function")
        trainVoiceAI(verbose=verbose, numDefault=int(userID)) #CHANGE FROM DEF=ID WHEN NOT TESTING!!!!
    elif (operation == "test"):
        if verbose: print("Running Test Data")
        testData(verbose=verbose)
    
    if verbose: print("Code Complete!")

if __name__ == "__main__":
    main()