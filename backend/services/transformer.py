import json
import pandas as pd
import xmltodict
from dicttoxml import dicttoxml
import io

def transform_data(input_data: str, input_format: str, output_format: str) -> str:
    # If the format is the same, no need to transform
    if input_format == output_format:
        return input_data

    # 1. Parse Input
    data_obj = None
    if input_format == 'json':
        try:
            data_obj = json.loads(input_data)
        except Exception as e:
            raise ValueError(f"Invalid JSON: {e}")
            
    elif input_format == 'csv':
        try:
            df = pd.read_csv(io.StringIO(input_data))
            data_obj = df.to_dict(orient="records")
        except Exception as e:
            raise ValueError(f"Invalid CSV: {e}")
            
    elif input_format == 'xml':
        try:
            parsed = xmltodict.parse(input_data)
            # Flatten typical xml structure to make it play nicer with CSV/JSON
            if len(parsed) == 1:
                root_key = list(parsed.keys())[0]
                data_obj = parsed[root_key]
                if isinstance(data_obj, dict) and len(data_obj) == 1:
                    inner_key = list(data_obj.keys())[0]
                    if isinstance(data_obj[inner_key], list):
                        data_obj = data_obj[inner_key]
            else:
                data_obj = parsed
        except Exception as e:
            raise ValueError(f"Invalid XML: {e}")

    # 2. Format Output
    if output_format == 'json':
        try:
            return json.dumps(data_obj, indent=2)
        except Exception as e:
            raise ValueError(f"Error generating JSON: {e}")
            
    elif output_format == 'csv':
        try:
            if isinstance(data_obj, dict):
                # If it's a single dict, wrap in a list so pandas can create rows
                data_obj = [data_obj]
            elif not isinstance(data_obj, list):
                # Fallback for scalar primitives
                data_obj = [{"value": str(data_obj)}]
                
            df = pd.DataFrame(data_obj)
            return df.to_csv(index=False)
        except Exception as e:
            raise ValueError(f"Error generating CSV: {e}")
            
    elif output_format == 'xml':
        try:
            xml_bytes = dicttoxml(data_obj, custom_root='root', attr_type=False)
            # Prettify the XML string
            import xml.dom.minidom
            dom = xml.dom.minidom.parseString(xml_bytes)
            # toprettyxml adds some blank lines but it is visually acceptable
            return dom.toprettyxml(indent="  ")
        except Exception as e:
            raise ValueError(f"Error generating XML: {e}")
