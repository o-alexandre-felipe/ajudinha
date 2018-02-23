import argparse;
import iris_data
import tensorflow as tf
import numpy as np;
import keras;

def npModelPredict(weights, x):
  def softMax(x):
    ex = np.exp(x);
    return ex / np.sum(ex[:]);
  def relu(x):
    return 0.5*(abs(x) + x);
  for (W,b) in weights[:-1]:
    x = relu(np.dot(x, W)+b);
  W,b = weights[-1];
  y_hat = softMax(np.dot(x, W)+b);
  prediction = np.argmax(y_hat, axis=1);
  return prediction;


def main(argv):
  # configuration
  args = parser.parse_args(argv[1:]);
  num_classes = 3;
  hidden_units = []
  # Fetch the data
  (train_x, train_y), (test_x, test_y) = iris_data.load_data()
  train_y_onehot = np.zeros((len(train_y), 3));
  test_y_onehot  = np.zeros((len( test_y), 3));
  train_y_onehot[np.arange(len(train_y)),train_y] = 1;
  test_y_onehot[np.arange( len( test_y)), test_y] = 1;
  my_feature_columns = [
    tf.feature_column.numeric_column(key=key) for key in train_x.keys()];
  hidden_units = [];

  # Construct layers
  inputLayer = keras.layers.Input(shape=(len(my_feature_columns),));
  hiddenLayers = [];
  for units in hidden_units:
    hiddenLayers.append(keras.layers.Dense(units, activation='relu'));
  outputLayer = keras.layers.Dense(num_classes, activation='softmax');
  # Connect Layers, construct a model
  xi = inputLayer;
  # they mention dropout probability of 0.1 in the code
  # but i am unable to see it.
  d = keras.layers.Dropout(0.1); 
  for L in hiddenLayers:
    xi = d(L(xi));
  prediction = outputLayer(xi);

  optimizer = keras.optimizers.Adagrad(lr=0.1);
  model = keras.models.Model(inputLayer, prediction);
  model.compile(loss='categorical_crossentropy',
              optimizer=optimizer,
              metrics=['accuracy'])
  
  # process the data with the model
   
  model.fit(train_x, train_y_onehot,
          batch_size=args.batch_size,
          epochs=args.train_steps,
          verbose=0)

  scores = model.evaluate(test_x, test_y_onehot, verbose=0)
  print('Acuracy (in the validation data) is %.3f%%' % (scores[1]*100));
  trainedWeights = [L.get_weights() for l in hiddenLayers];
  trainedWeights.append(outputLayer.get_weights());
  pred = npModelPredict(trainedWeights, test_x);
  print('Acuracy of plain implementation is %.3f%%' % (100*np.mean(pred == test_y)));

parser = argparse.ArgumentParser()
parser.add_argument('--batch_size', default=100, type=int, help='batch size')
parser.add_argument('--train_steps', default=1000, type=int,
                    help='number of training steps')
if __name__ == '__main__':
  #  tf.logging.set_verbosity(tf.logging.INFO)
  tf.app.run(main)
