Functions
==============
There are three main user functions for rendering and plotting SAMMI visualizations. These are:

Plotting
--------------
The function :code:`sammi` is used to plot SAMMI visualizations in combination with the SAMMI structured arrays. The function definition is:

.. code-block:: matlab

   sammi(model,parser,data,secondaries,options)

The function inputs are as follows:

- **model**: COBRA model to be visualized.
- **parser**: How the model is to be parsed and visualized. There are several options for this parameter:

   - *Empty vector*: Default. Does not parse the model and plots all reactions and metabolites in a single graph. Not recommended for medium to large-size models.
   - *string*: One of two options. (1) A reaction or metabolite field (e.g. :code:`subsystem` or :code:`compartment`), in which case a subgraph will be drawn for each unique value associated with that field. (2) A path to a file specifying a previously drawn SAMMI map, in which case that map will be rendered.
   - *Cell array of strings*: List of reaction IDs to be plotted. A single graph will be plotted containing only the defined reactions.
   - *Parser structured array of length n*: A subgraph is plotted for each element of the array as defined in the previous section.
- **data**: Data structured array of length :code:`n`. All defined datasets and data types will be mapped as described in the previous section.
- **secondaries**: Cell array of strings or regular expressions. Any metabolite, in any subgraph, matching any of the regular expressions defined here will be shelved. These metabolites are not deleted and can be returned to the graph through the floating menu window. For details of this functionality please refer to the SAMMI documentation.
- **options**: Options structured array as defined in the previous section. Additional options for loading the map.

Opening a visualization
--------------------------
The function :code:`openSammi` is used to open previously drawn visualizations. It takes a single input: a string defining a previously drawn map html file name. For instance, :code:`openSammi('index_load.html')` or :code:`openSammi('index_load')` opens the default html file to which SAMMIM writes metabolic maps.

Running SAMMIM examples
-------------------------------
The SAMMIM examples described in the next section are available in the :code:`testSammi` function. To try the described examples run :code:`testSammi(n)` where :code:`n` ranges from zero to eleven referring to the example number. To visualize the code for each example run :code:`edit testSammi` from the MATLAB command window.