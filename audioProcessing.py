#Dustin Smith
#Audio File Pre-Processor for AI training dataset
#Primary resource for creation: https://towardsdatascience.com/how-to-build-a-neural-network-for-voice-classification-5e2810fe1efa

import os as os
import pandas as pd
import numpy as np
import librosa as librosa

def wavToTrainingData(file):
    pass

#list the files
filelist = os.listdir('30_speakers_train') 
#read them into pandas
train_df = pd.DataFrame(filelist)
# Renaming the column name to file
train_df = train_df.rename(columns={0:'file'})
# Code in case we have to drop the '.DS_Store' and reset the index
train_df[train_df['file']=='.DS_Store']
train_df.drop(16, inplace=True)
train_df = train_df.sample(frac=1).reset_index(drop=True)
# We create an empty list where we will append all the speakers ids for each row of our dataframe by slicing the file name since we know the id is the first number before the hash
speaker = []
for i in range(0, len(df)):
    speaker.append(df['file'][i].split('-')[0])
# We now assign the speaker to a new column 
train_df['speaker'] = speaker

def extract_features(files):
    # Sets the name to be the path to where the file is in my computer
    file_name = os.path.join(os.path.abspath('30_speakers_train')+'/'+str(files.file))
    # Loads the audio file as a floating point time series and assigns the default sample rate
    # Sample rate is set to 22050 by default
    X, sample_rate = librosa.load(file_name, res_type='kaiser_fast')
    # Generate Mel-frequency cepstral coefficients (MFCCs) from a time series 
    mfccs = np.mean(librosa.feature.mfcc(y=X, sr=sample_rate, n_mfcc=40).T,axis=0)
    # Generates a Short-time Fourier transform (STFT) to use in the chroma_stft
    stft = np.abs(librosa.stft(X))
    # Computes a chromagram from a waveform or power spectrogram.
    chroma = np.mean(librosa.feature.chroma_stft(S=stft, sr=sample_rate).T,axis=0)
    # Computes a mel-scaled spectrogram.
    mel = np.mean(librosa.feature.melspectrogram(X, sr=sample_rate).T,axis=0)
    # Computes spectral contrast
    contrast = np.mean(librosa.feature.spectral_contrast(S=stft, sr=sample_rate).T,axis=0)
    # Computes the tonal centroid features (tonnetz)
    tonnetz = np.mean(librosa.feature.tonnetz(y=librosa.effects.harmonic(X), sr=sample_rate).T,axis=0)
    return mfccs, chroma, mel, contrast, tonnetz

train_features = train_df.apply(extract_features, axis=1)


features_train = []
for i in range(0, len(train_features)):
    features_train.append(np.concatenate((
        train_features[i][0],
        train_features[i][1], 
        train_features[i][2], 
        train_features[i][3],
        train_features[i][4]), axis=0))

X_train = np.array(features_train)

y_train = np.array(train_df['speaker'])
y_val = np.array(val_df['speaker'])

from sklearn.preprocessing import LabelEncoder
from keras.utils.np_utils import to_categorical
# Hot encoding y
lb = LabelEncoder()
y_train = to_categorical(lb.fit_transform(y_train))
y_val = to_categorical(lb.fit_transform(y_val))

from sklearn.preprocessing import StandardScaler
ss = StandardScaler()
X_train = ss.fit_transform(X_train)
X_val = ss.transform(X_val)
X_test = ss.transform(X_test)

train_features = train_df.apply(extract_features, axis=1)
def main():
    pass
if __name__ == "__main__":
    main()