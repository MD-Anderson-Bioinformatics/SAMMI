Structure Arrays
=======================
Three different structure arrays can be used to render visualizations using the SAMMIM package. To learn more about MATLAB structure arrays please refer to `this
<https://www.mathworks.com/help/matlab/ref/struct.html>`_ documentation. This section describes these variables. For details on how to use them and working examples please refer to the subsequent sections. These variables are the following:

Parser
--------------
Using SAMMI, models can be parsed into subgraphs upon rendering for more appealing visualizations. While there are many different ways to parse models (covered in the next section), one of the options is defining a structure array of length :code:`n` where a subgraph is plotted for each element of the array. Each element in the array should contain the following fields:

- **rxns**: Cell array of strings. Reaction IDs of reactions to be included in the subgraph.
- **name**: String. Name of the subgraph to be displayed in the visualization.
- **flux**: Numerical vector. Optional. Values to be mapped as reaction colors. Defaults to all NaNs where no data is mapped.

Data
--------------
The data structured array can be used to map different datasets, in different forms, onto the rendered illustration. This structured array can also be of length :code:`n`, where each element of the array will map a dataset differently. Each element of the array must contain the following fields:

- **type**: Cell array of two strings. The first string should be either :code:`rxns`, :code:`mets`, or :code:`links`. This string defines where the data will be mapped. The second string should be either :code:`color` or :code:`size`. This string defines what kind of data to map onto the defined group. :code:`color` can be user with :code:`rxns` and :code:`mets` to define node and link color. :code:`color` cannot be used with :code:`links`, as link color matches the corresponding reaction node color. :code:`size` can be used with all options to define node radius or link width.
- **data**: A MATLAB table object. To learn more about MATLAB tables please refer to `this <https://www.mathworks.com/help/matlab/tables.html>`_ documentation. :code:`VariableNames` (column names) will be translated into condition names, and :code:`RowNames` should be reaction IDs for :code:`rxns` and :code:`links` data or metabolite IDs for :code:`mets` data. :code:`NaN` values will not be mapped.

Options
--------------
Optional structured array to change default rendering options. This is an array of length one with three optional fields:

- **htmlName**: String. Name of html file where the output will be written. Defaults to :code:`index_load.html`. If this option is not defined, the file :code:`index_load.html` will be continuously overwritten every time a new visualization is generated. If users wish to save a visualization to a different file, or wish to visualize multiple maps at once, this parameter can be changed.
- **load**: Boolean, defaults to :code:`True`. Whether or not to load the visualization on a new browser tab. If this parameter is set to false, new visualizations can be rendered by refreshing a previously loaded tab or by using the :code:`openSammi()` function.
- **jscode**: String. Sequence of JavaScript commands to be run following the rendering of the visualization. This can be used, for example, to change colorscales and subgraphs upon loading the model. This options requires familiarity with JavaScript and the SAMMI html layout.