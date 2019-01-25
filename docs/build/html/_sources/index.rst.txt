Semi-Automated Metabolic Map Illustrator
==========================================

Welcome to SAMMI, the Semi-Automated Metabolic Map Illustrator. SAMMI is a tool developed for the visualization of metabolic networks. In SAMMI, metabolic networks are illustrated by directed bipartite graphs, where reactions and metabolites represent two distinct groups of nodes. Substrate metabolites connect into reaction nodes, which in turn connect to product metabolites.

.. figure:: images/reaction.jpg
   :width: 400
   :align: center

   Visual illustration of a metabolic reaction as represented by a bipartite graph.

SAMMI renders metabolic maps as interactive, constantly updated force-directed graphs, allowing for efficient automated node positioning. The tool has also been developed to allow a wide array of node editing and positioning functionalities, as well as easy graph parsing and navigation. SAMMI can be used for both context-specific visualizations, where users can upload their own reaction and/or metabolite data in order to visualize the context of their own network, or to generate visually appealing models that can be easily shared among SAMMI users.

Documentation
=================

The following documentation describes all the tools available in SAMMI.

.. toctree::
   :maxdepth: 2

   loading
   interface
   graphSettings
   data
   secondaries
   navigation
   download
   floating
   shortcuts
   format
   copyright
   contact
