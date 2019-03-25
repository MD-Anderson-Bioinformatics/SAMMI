COBRA Exports
=======================================

The COnstraint-Based Reconstruction and Analysis (COBRA) toolbox is one of the most popular toolboxes for modeling metabolic networks. COBRA has been developed for MATLAB (`Heirendt et. al.
<https://www.ncbi.nlm.nih.gov/pubmed/30787451>`_), Python (`Ebrahim et. al.
<https://www.ncbi.nlm.nih.gov/pubmed/23927696>`_) and Julia (`Heirendt et. al. (b)
<https://www.ncbi.nlm.nih.gov/pubmed/28453682>`_) programming languages, all of which can be accessed through `this link
<https://opencobra.github.io/.>`_.

The MATLAB and Python versions of COBRA offer tools for exporting metabolic models in versions compatible with SAMMI. In this section we cover these options and offer alternative scripts to do so. Support for Julia will be added once the toolbox is made compatible with Julia 1.0. It is worth noting that all of these options export models in version that should first be loaded as SBML models, not SAMMI specific formats (e.g. using the "Load Single Model" or "Load Model to Parse" options in the SAMMI home page).

MATLAB
-----------------

MATLAB COBRA models are defined by a struct variable. The COBRA toolbox offers the function ``writeCbModel`` to export models in a variety of formats. Files can be exported in the SBML format for SAMMI compatibility:

.. code-block:: matlab

    writeCbModel(model,'format','sbml')

This will generate an XML file that can be uploaded in the SAMMI interface. To define other function call arguments please refer to the ``writeCbModel`` documentation.

While this option provides an SBML compatible model, user defined fields are not exported, and reaction and metabolite IDs may be altered in the export process. To account for these issues, we provide the following script defining the ``sammiJson`` function, which exports the model to a SAMMI compatible JSON file. Here, all struct fields with the same size as the ``rxns`` field are exported as reaction-associated data, and all fields with the same size as the ``mets`` field are exported as metabolite associated data.

Download script here: :download:`sammiJson.m <files/sammiJson.m>`

You can test the given function with following bit of code that will generate the ``e_coli_core.json`` file:

.. code-block:: matlab

    %Get COBRA directory
    global CBTDIR;
    %Load models to test
    load([CBTDIR '/test/models/mat/ecoli_core_model.mat'])
    %Add random field
    model.newMetField = rand(length(model.mets),1);
    model.newRxnField = rand(length(model.rxns),1);
    %Write to file
    sammiJson(model,'e_coli_core')


Python
-----------------

Metabolic models is COBRApy are defined by a toolbox specific ``cobra.DictList`` class variable. COBRApy offers the function ``save_json_model`` that exports models to a SAMMI compatible JSON file with the function call:

.. code-block:: python

    cobra.io.save_json_model(model, "test.json")

This function call also does not export user-defined fields, however. For that we provide the following alternative script defining the ``sammiJson`` function that exports to a JSON file all reaction and metabolite fields defined by a string, float, int or bool. It is worth noting that this approach will generate larger files with perhaps unwanted fields.

Download script here: :download:`sammiJson.py <files/sammiJson.py>`

Once the function is loaded you can test it with the following bit of script.

.. code-block:: python

    #Read in model
    model = cobra.test.create_test_model("salmonella")
    #Add random reaction fields
    for rx in model.reactions:
        rx.addedFieldNum = np.random.rand()
        rx.addedFieldString = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    #Add random metabolite fields
    for met in model.metabolites:
        met.addedFieldNum = np.random.rand()
        met.addedFieldString = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))
    #Write to file
    sammiJson(model,'core.json')
