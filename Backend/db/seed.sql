-- Clear out existing words and reset IDs
TRUNCATE TABLE words RESTART IDENTITY CASCADE;


-- EASY WORDS (10)

INSERT INTO words (word, definition, difficulty) VALUES
  ('cat',       'A small furry animal that says meow.',              'easy'),
  ('dog',       'A friendly animal that barks and wags its tail.',   'easy'),
  ('ball',      'A round toy you can throw and catch.',              'easy'),
  ('sun',       'The bright light in the sky during the day.',       'easy'),
  ('mom',       'Your mother, the person who cares for you.',        'easy'),
  ('dad',       'Your father, the person who cares for you.',        'easy'),
  ('car',       'A vehicle that people ride in to go places.',       'easy'),
  ('red',       'A bright color, like a strawberry.',                'easy'),
  ('blue',      'A color like the sky or the ocean.',                'easy'),
  ('bed',       'Where you lie down to sleep at night.',             'easy');


-- MEDIUM WORDS (10)

INSERT INTO words (word, definition, difficulty) VALUES
  ('happy',     'Feeling good and smiling.',                          'medium'),
  ('angry',     'Feeling upset when something is wrong.',             'medium'),
  ('forest',    'A place with many trees and animals.',               'medium'),
  ('ocean',     'A huge body of salty water.',                        'medium'),
  ('cookie',    'A small sweet treat you can eat.',                   'medium'),
  ('train',     'A long vehicle that moves on tracks.',               'medium'),
  ('chair',     'Something you sit on.',                              'medium'),
  ('water',     'What you drink when you are thirsty.',               'medium'),
  ('night',     'The dark time when the sun is gone.',                'medium'),
  ('yellow',    'A bright color like a banana.',                      'medium');


-- HARD WORDS (10)

INSERT INTO words (word, definition, difficulty) VALUES
  ('dinosaur',      'A very big animal that lived a long time ago.',          'hard'),
  ('astronaut',     'A person who travels into space.',                       'hard'),
  ('adventure',     'An exciting trip or new experience.',                    'hard'),
  ('thunderstorm',  'Rain with loud thunder and bright lightning.',           'hard'),
  ('mountain',      'A very tall part of the land that reaches up high.',     'hard'),
  ('rainbow',       'Many colors in the sky after rain.',                     'hard'),
  ('whisper',       'To talk very softly and quietly.',                       'hard'),
  ('elephant',      'A very large animal with a long trunk.',                 'hard'),
  ('treasure',      'Something very special or valuable, often hidden.',      'hard'),
  ('volcano',       'A mountain that can spit out hot lava and smoke.',       'hard');