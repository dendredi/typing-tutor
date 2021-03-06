import { Injectable } from '@angular/core';
import { AbstractSyntaxTree } from '../model/ast/abstract-syntax-tree';
import { CallExpression } from '../model/ast/ast-nodes/call-expression';
import { Definition } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/definition';
import { FunctionDeclaration } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/function-declaration';
import { GlobalVariableDeclaration } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/global-variable-declaration';
import { Identifier } from '../model/ast/ast-nodes/identifier';
import { IfStatement } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/if-statement';
import { IndexExpression } from '../model/ast/ast-nodes/index-expression';
import { Literal } from '../model/ast/ast-nodes/literal';
import { PointerTypeExpression } from '../model/ast/ast-nodes/type-expressions/pointer-type-expression';
import { ReturnStatement } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/return-statement';
import { StructDefinition } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/struct-definition';
import { BaseTypeExpression, TypeName } from '../model/ast/ast-nodes/type-expressions/base-type-expression';
import { VariableDeclaration } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/variable-declaration';
import { BinaryExpression, BinaryOperator } from '../model/ast/ast-nodes/binary-expression';
import { StructAccessExpression } from '../model/ast/ast-nodes/struct-access-expression';
import { ExpressionStatement } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/expression-statement';
import { PrefixExpression, PrefixOperator } from '../model/ast/ast-nodes/prefix-expression';
import { StructTypeExpression } from '../model/ast/ast-nodes/type-expressions/struct-type-expression';
import { AbstractTypeExpression } from '../model/ast/ast-nodes/type-expressions/abstract-type-expression';
import { InitializerListArray } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/initializer-list-array';
import { InitializerListStruct, StructMemberValue } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/initializer-list-struct';
import { AstNode, NodeType } from '../model/ast/ast-node';
import { TypeDefStatement } from '../model/ast/ast-nodes/DEPRECATED-AST-NODES/type-def-statement';
import { AliasTypeExpression } from '../model/ast/ast-nodes/type-expressions/alias-type-expression';

const parse = require('../../assets/js/cparse/cparse.js');

export class IncompleteAstWrapperException extends Error {

  public rawAstNodeType: string;
  public rawParsedJson: string;

  constructor(rawAstNodeType: string, rawParsedJson: string = null) {
    super("Ast wrapper implementation incomplete. Support for type " + rawAstNodeType + " not implemented yet.");
    this.rawAstNodeType = rawAstNodeType;
    this.rawParsedJson = rawParsedJson;
  }
}

@Injectable({
  providedIn: 'root'
})
export class ParsingService {

  constructor() { }

  public parseExpression(code: string): AbstractSyntaxTree {
    const extendedCode = `int main(){return ${code};}`
    const root = this.parseImpl(extendedCode)[0];
    if(root instanceof FunctionDeclaration) {
      if(root.body[0] instanceof ReturnStatement){
        const expressionAstNode = root.body[0].value;
        return new AbstractSyntaxTree([expressionAstNode]);
      }
    }
    throw new Error("Unexpected AST structure");
  }

  public parse(code: string): AbstractSyntaxTree {
    const roots = this.parseImpl(code);
    return new AbstractSyntaxTree(roots);
  }

  private parseImpl(code: string): AstNode[] {
    const parsedRaw: any[] = parse(code);

    //console.log("Parsed raw:");
    //console.log(parsedRaw);

    const roots = parsedRaw.map(x => this.rawToAstNode(x));

    return roots;
  }

  private rawToAstNode(x: any): AstNode {
    const type = x["type"];
    if (!type) throw new Error("Unexpected: Parsed raw ast node does not contain field 'type'.");

    let out: AstNode;

    switch (type) {
      case NodeType.CallExpression:
        out = this.rawToAstNode_CallExpression(x);
        break;
      case NodeType.Definition:
        out = this.rawToAstNode_Definition(x);
        break;
      case NodeType.FunctionDeclaration:
        out = this.rawToAstNode_FunctionDeclaration(x);
        break;
      case NodeType.GlobalVariableDeclaration:
        out = this.rawToAstNode_GlobalVariableDeclaration(x);
        break;
      case NodeType.Identifier:
        out = this.rawToAstNode_Identifier(x);
        break;
      case NodeType.IfStatement:
        out = this.rawToAstNode_IfStatement(x);
        break;
      case NodeType.IndexExpression:
        out = this.rawToAstNode_IndexExpression(x);
        break;
      case NodeType.Literal:
        out = this.rawToAstNode_Literal(x);
        break;
      case NodeType.PointerType:
        out = this.rawToAstNode_PointerType(x);
        break;
      case NodeType.ReturnStatement:
        out = this.rawToAstNode_ReturnStatement(x);
        break;
      case NodeType.StructDefinition:
        out = this.rawToAstNode_StructDefinition(x);
        break;
      case NodeType.Type:
        out = this.rawToAstNode_Type(x);
        break;
      case NodeType.VariableDeclaration:
        out = this.rawToAstNode_VariableDeclaration(x);
        break;
      case NodeType.BinaryExpression:
        out = this.rawToAstNode_BinaryExpression(x);
        break;
      case NodeType.ExpressionStatement:
        out = this.rawToAstNode_ExpressionStatement(x);
        break;
      case NodeType.PrefixExpression:
        out = this.rawToAstNode_PrefixExpression(x);
        break;
      case NodeType.TypeDefStatement:
        out = this.rawToAstNode_TypeDefStatement(x);
        break;
      default: throw new IncompleteAstWrapperException(type, x);
    }

    return out;
  }

  // One method mapping from any to AstNode for every subtype
  // TODO: Move to classes instead??
  private rawToAstNode_CallExpression(x: any): CallExpression {
    const base: Identifier = <Identifier>this.rawToAstNode(x["base"]);

    var args: Definition[];
    if (x["arguments"].length === 1 && x["arguments"][0] === undefined) {
      // Note: the underlying parser implementation handles a call without any arguments with an array containing 'undefined' once
      args = [];
    } else {
      args = x["arguments"].map((x: any) => <AstNode>this.rawToAstNode(x));
    }
    return new CallExpression(x["pos"]["line"], base, args);
  }

  private rawToAstNode_Definition(x: any): Definition {
    const defType = <BaseTypeExpression | PointerTypeExpression>this.rawToAstNode(x["defType"]);
    const name: string = x["name"]
    return new Definition(x["pos"]["line"], defType, name);
  }

  private rawToAstNode_FunctionDeclaration(x: any): FunctionDeclaration {
    const defType = <BaseTypeExpression | PointerTypeExpression>this.rawToAstNode(x["defType"]);
    const name: string = x["name"];
    const args = <Definition[]>x["arguments"].map((x: any) => this.rawToAstNode(x));
    const body = x["body"].map((x: any) => this.rawToAstNode(x));

    return new FunctionDeclaration(x["pos"]["line"], defType, name, args, body);
  }

  private rawToAstNode_GlobalVariableDeclaration(x: any): GlobalVariableDeclaration {
    const defType = <BaseTypeExpression | PointerTypeExpression>this.rawToAstNode(x["defType"]);
    const name: string = x["name"];
    const value = this.rawToAstNode(x["value"]);
    return new GlobalVariableDeclaration(x["pos"]["line"], defType, name, value);
  }

  private rawToAstNode_Identifier(x: any): Identifier {
    const value = x["value"];
    return new Identifier(x["pos"] ? x["pos"]["line"] : -1, value);
  }

  private rawToAstNode_IfStatement(x: any): IfStatement {
    const condition = this.rawToAstNode(x["condition"]);
    const ifBlock = x["body"].map((x: any) => this.rawToAstNode(x));
    const elseBlock = x["else"].map((x: any) => this.rawToAstNode(x));
    return new IfStatement(x["pos"]["line"], condition, ifBlock, elseBlock);
  }

  private rawToAstNode_IndexExpression(x: any): IndexExpression {
    const value = this.rawToAstNode(x["value"]);
    const index = this.rawToAstNode(x["index"]);
    return new IndexExpression(x["pos"]["line"], value, index);
  }

  private rawToAstNode_Literal(x: any): Literal | InitializerListArray | InitializerListStruct {
    let value = x["value"];

    const line: number = x["pos"]["line"];

    if (Array.isArray(value)) {
      // e.g. {1, 2, 3}
      //const children: AstNode[] = this.rawToAstNode(value);

      if (value.length === 1 && value[0] === undefined) {
        // Note: the underlying parser implementation an empty InitializerList with an array containing 'undefined' once
        value = [];

      }

      if (this.conformsToInitializerListStruct(value)) {
        const children = this.extractInitializerListStructChildren(value).map(({member, value}) => {          
          //return new StructMemberValue(line, <Identifier>this.rawToAstNode(member), this.rawToAstNode(value))
          return new StructMemberValue(line, member["value"], this.rawToAstNode(value))
        });
        return new InitializerListStruct(line, children);

      } else {
        const children: AstNode[] = value.map((x: any) => <AstNode>this.rawToAstNode(x));
        return new InitializerListArray(line, children);
      }
    } else {
      // e.g. "Hello world"
      return new Literal(line, value);
    }
  }

  private rawToAstNode_PointerType(x: any): PointerTypeExpression {
    const target = <BaseTypeExpression>this.rawToAstNode(x["target"]);
    return new PointerTypeExpression(x["pos"]["line"], target);
  }

  private rawToAstNode_ReturnStatement(x: any): ReturnStatement {
    const value = this.rawToAstNode(x["value"]);
    return new ReturnStatement(x["pos"]["line"], value);
  }

  private rawToAstNode_StructDefinition(x: any): StructDefinition {
    const name = x["name"];
    const member = x["member"].map((x: any) => this.rawToAstNode(x));
    return new StructDefinition(x["pos"]["line"], name, member);
  }

  private rawToAstNode_Type(x: any): BaseTypeExpression | StructTypeExpression {
    const line: number = x["pos"]["line"];
    const name = x["name"];

    if (x["modifier"].find((e: any) => e === "struct")) {
      return new StructTypeExpression(line, name);
    }
    if(Object.values(TypeName).includes(name)){
      return new BaseTypeExpression(line, name);
    }
    return new AliasTypeExpression(line, name);
  }

  private rawToAstNode_VariableDeclaration(x: any): VariableDeclaration {
    const defType = <AbstractTypeExpression>this.rawToAstNode(x["defType"]);
    const name: string = x["name"];
    const value = this.rawToAstNode(x["value"]);
    return new VariableDeclaration(x["pos"]["line"], defType, name, value);
  }

  private rawToAstNode_BinaryExpression(x: any): BinaryExpression | StructAccessExpression {
    const line: number = x["pos"]["line"];
    const operator = x["operator"];
    const left = this.rawToAstNode(x["left"]);
    const right = this.rawToAstNode(x["right"]);

    /*
    Note:
    
    Some BinaryOperators get special treatment, e.g. 'a->b' will be translated to '(*a).b'
    Default it simple BinaryExpression node.
    
    */
    switch (operator) {
      case ".":
        return new StructAccessExpression(line, <Identifier>left, <Identifier>right);
      case "->":
        const derefNode = new PrefixExpression(line, left, PrefixOperator.DEREF);
        return new StructAccessExpression(line, derefNode, <Identifier>right);
      default:
        return new BinaryExpression(line, operator, left, right)
    };
  }

  private rawToAstNode_ExpressionStatement(x: any): ExpressionStatement {
    const expression = this.rawToAstNode(x["expression"]);
    return new ExpressionStatement(x["pos"]["line"], expression);
  }

  private rawToAstNode_PrefixExpression(x: any): PrefixExpression {
    const value = this.rawToAstNode(x["value"]);
    return new PrefixExpression(x["pos"]["line"], value, x["operator"]);
  }

  private rawToAstNode_TypeDefStatement(x: any): TypeDefStatement {
    const target = this.rawToAstNode(x["defType"]);
    return new TypeDefStatement(x["pos"]["line"], target, x["name"]);
  }

  // Helper

  private conformsToInitializerListStruct(values: any[]): boolean {
    if (!values || values.length === 0) return false;

    let constraints: boolean[] = new Array();
    try {
      constraints.push(values[0]["type"] === "BinaryExpression");
      constraints.push(values[0]["operator"] === "=");
      constraints.push(values[0]["left"]["type"] === "BinaryExpression");
      constraints.push(values[0]["left"]["operator"] === ".");
      constraints.push(values[0]["left"]["left"] === undefined);
    } catch(e) {
      return false;
    }

    return constraints.every(c => c);
  }

  private extractInitializerListStructChildren(values: any[]): any[] {
    return values.map(element => {

      const member = element["left"]["right"];
      const value = element["right"];

      return {member, value};
    });
  }
}
