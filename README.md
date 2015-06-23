GenDrum
=======

GenDrum is a Max4Live device that generates drum patterns using Genetic Algorithms. An input pattern is set as a target pattern and new ones are generated automatically. The fitness of new patterns is determined by analysing its similarity to the target pattern using a choice of two distance metrics: the Hamming distance or the directed-swap distance. Essentially the Hamming is simpler and faster, for a more thorough comparison please read the paper here (http://mtg.upf.edu/node/3259).

Uses SimpleGA (https://github.com/carthach/SimpleGA). 

Installation and Usage
======================
Copy the entire contents of the project into a folder called GenDrum or something similar in your Max Instruments location.
